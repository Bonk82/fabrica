'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Chip, Flex, Grid, Group, LoadingOverlay, NativeSelect, NumberFormatter, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconCalendar, IconCalendarEvent, IconCategoryPlus, IconCheck, IconCurrencyDollar, IconDeviceFloppy, IconEdit, IconEye, IconRefresh, IconShoppingCartPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
import { BarChart,LineChart } from '@mantine/charts';
import dayjs from 'dayjs';
import { DatePickerInput } from '@mantine/dates';
import axios from 'axios';

const Page = () => {
  const { loading,setLoading,getReg,getRegFilter,transacciones,pedidos,productos,parametricas} = useSupa();
  const [listaProductos, setListaProductos] = useState([])
  const [listaPedidos, setListaPedidos] = useState([])
  const [pedidosDia, setPedidosDia] = useState([])
  const colores = ['violet.6','green.6','red.6'];
  const [f1, setF1] = useState(dayjs().startOf('month'))
  const [f2, setF2] = useState(dayjs().endOf('month'))
  const [periodo, setPeriodo] = useState('DÍA')

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async ()=>{
    const ped = await getReg('vw_pedido','id_pedido',false);
    const prod = await getReg('producto','id_producto',false);
    const tran = await getRegFilter('vw_transaccion','fecha_entrega',dayjs(f1).format('YYYY-MM-DD 04:00:00'),'between',dayjs(f2).format('YYYY-MM-DD 23:59:59'))
    armarData(ped,prod,tran)
  }

  const armarData= async (ped,prod,tran)=>{
    console.log('productos',prod);
    console.log('transacciones',tran);
    console.log('pedidos',ped);
    prod.forEach((p,i) => {
      listaProductos.push({name:p.existencia,color:colores[i]})
    });
    const pivot = []
    const pivotDia = []
    await tran.forEach(t => {
      pivot.filter(f=>f.cliente == t.cliente)[0]
        ? pivot.filter(f=>f.cliente == t.cliente)[0].monto_pago += t.monto_pago
        : pivot.push({cliente:t.cliente,monto_pago:t.monto_pago});

      pivotDia.filter(f=>f.fecha_entrega == t.fecha_entrega)[0]
        ? pivotDia.filter(f=>f.fecha_entrega == t.fecha_entrega)[0].cantidad_entregada += t.cantidad_entregada
        : pivotDia.push({fecha_entrega:t.fecha_entrega,cantidad_entregada:t.cantidad_entregada})
    });
    setListaPedidos(pivot)
    await pivotDia.map(d=>{
      d.fecha_entrega = dayjs(d.fecha_entrega).format('DD MMM')
      return d;
    })
    setPedidosDia(pivotDia)
    // obtenerReporte('UNO',listaProductos)
    console.log('listaProductos',listaProductos,pivot,pivotDia);
  }

  const obtenerReporte = async (tipo,data) =>{
    console.log('obteneinedo report',tipo,data);
    setLoading(true)
    try {
      const templateData = {
        filename: 'report-template.docx', // Cambia el nombre de la plantilla según tu caso
      };
      await data.map(e => {
        e.f1 = f1;
        e.f2 = f2;
        return e;
      });
      const response2 = await axios.post('/api/reports', { templateData, data }, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response2.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report.docx'); // Ajusta el nombre del archivo según tu caso
      document.body.appendChild(link);
      link.click();
      // setMessage(response.data.message);
      console.log('la respuesta API',response2);
    } catch (error) {
      // setError('Error fetching data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const onChangePeriodo = (e)=>{
      setPeriodo(e)
      let f1,f2
      if(e == 'DÍA'){
        f1 = dayjs()
        f2 = dayjs()
      } 
      if(e == 'SEMANA'){
        f1 = dayjs().startOf('week').add(1,'day');
        f2 = dayjs().endOf('week').add(5,'hours');
      } 
      if(e == 'MES'){
        f1 = dayjs().startOf('month');
        f2 = dayjs().endOf('month')
      } 
      if(e == 'AÑO'){
        f1 = dayjs().startOf('year');
        f2 = dayjs().endOf('year')
      } 
      setF1(f1)
      setF2(f2)
      cargarData()
    }


  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          mb={20}
          pb={10}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Datos del {dayjs(f1).format('DD MMM YYYY')} al {dayjs(f2).format('DD MMM YYYY')}
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Flex gap='xs' direction='row' wrap='wrap' mt={8}>
          {parametricas.filter(f=>f.tipo == 'OBJETIVOS').map(p=>(
              <Chip key={p.id_parametrica} checked color="cyan">{p.nombre} : {p.agrupador}</Chip>
            ))}
        </Flex>
        <Flex gap='xs' direction='row' wrap='wrap' mt={8}>
          {productos.map(p=>( 
            <Chip key={p.id_producto} checked color="blue">{p.descripcion} : {p.existencia}</Chip>
          ))}
        </Flex>
        <Flex gap='xs' direction='row' wrap='wrap' mt={8}>
          <Chip checked size='md' icon={<IconCurrencyDollar size={16} />} variant='light' color="yellow.6">Total Monto Venta : <NumberFormatter prefix='Bs. ' thousandSeparator decimalScale={2} value={transacciones.filter(f=>f.fid_cuenta == 10).reduce((acc, curr) => acc + curr.monto, 0)}></NumberFormatter></Chip>
          <Chip checked size='md' icon={<IconShoppingCartPlus size={16} />} variant='light' color="green.6">Pedidos Hielo 3Kg : <NumberFormatter thousandSeparator value={transacciones.filter(f=>f.fid_cuenta == 10 && f.fid_producto == 1).reduce((acc, curr) => acc + curr.cantidad_entregada, 0)}></NumberFormatter></Chip>
          <Chip checked size='md' icon={<IconShoppingCartPlus size={16} />} variant='light' color="green.6">Pedidos Hielo 2Kg : <NumberFormatter thousandSeparator value={transacciones.filter(f=>f.fid_cuenta == 10 && f.fid_producto == 2).reduce((acc, curr) => acc + curr.cantidad_entregada, 0)}></NumberFormatter></Chip>
        </Flex>
        <Grid my={12} display='flex' align='end'>
          <Grid.Col span={{ base: 12, lg: 2 }}>
            <DatePickerInput
              value={f1}
              onChange={setF1}
              label="Fecha Inicio"
              placeholder="Fecha Inicio"
              size='sm'
              valueFormat='DD MMM YYYY'
              leftSection={<IconCalendar size={18} stroke={1.5} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 2 }}>
            <DatePickerInput
              value={f2}
              onChange={setF2}
              label="Fecha Fin"
              placeholder="Fecha Fin"
              size='sm'
              valueFormat='DD MMM YYYY'
              leftSection={<IconCalendar size={18} stroke={1.5} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 2 }}>
            <NativeSelect
              label="Periodo:"
              data={['DÍA', 'SEMANA','MES','AÑO']}
              value={periodo}
              leftSection={<IconCalendarEvent size={16} />}
              onChange={(event) => onChangePeriodo(event.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}><Button color='blue.2' variant='light' fullWidth onClick={()=>cargarData()} size='sm'>Cargar Transacciones</Button></Grid.Col>
          <Grid.Col span={{ base: 12, lg: 3 }}><Button color='green.5' variant='light' fullWidth onClick={()=>obtenerReporte('DOS',transacciones)} size='sm'> Histórico Pedidos</Button></Grid.Col>
        </Grid>
        <Box style={{display:'grid', gap:'1rem',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))'}}>
          {productos.length>0 &&
            <div>
              <Text ta={'center'} c="gainsboro" size='20px' fw={600} my={20}>
                Stock actual de Productos 
              </Text> 
              <BarChart
                h={300}
                data={productos}
                dataKey="descripcion"
                series={[{name:'existencia',color:'teal.6'}]}
                tickLine="y"
              />
            </div>
          }
          {listaPedidos.length>0 &&
            <div>
              <Text ta={'center'} c="gainsboro" size='20px' fw={600} my={20}>
                Cantidad ventas por cliente 
              </Text>
              <BarChart
                h={300}
                data={listaPedidos}
                dataKey="cliente"
                series={[{name:'monto_pago',color:'orange.4'}]}
                tickLine="y"
              />
          </div>
          }
        </Box>
        {pedidosDia.length>0 && 
        <>
        <Text ta={'center'} c="gainsboro" size='20px' fw={600} mt={20}>
          Pedidos por día
        </Text>   
        <LineChart
          style={{marginTop:'1rem'}}
          h={400}
          data={pedidosDia}
          dataKey="fecha_entrega"
          series={[{ name: 'cantidad_entregada', color: 'indigo.4' }]}
          curveType="bump"
          connectNulls
        />
        </>
        }
      </Box>
    </div>
  )
}

export default Page