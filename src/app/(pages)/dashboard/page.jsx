'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, NativeSelect, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconCheck, IconDeviceFloppy, IconEdit, IconEye, IconRefresh, IconTrash } from '@tabler/icons-react';
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
  const { loading,setLoading,getReg,getRegFilter,transacciones,pedidos,productos} = useSupa();
  const [listaProductos, setListaProductos] = useState([])
  const [listaPedidos, setListaPedidos] = useState([])
  const [pedidosDia, setPedidosDia] = useState([])
  const colores = ['violet.6','green.6','red.6'];
  const [f1, setF1] = useState(dayjs().startOf('month'))
  const [f2, setF2] = useState(dayjs().endOf('month'))

  // const data = [
  //   { month: 'January', Smartphones: 1200, Laptops: 900, Tablets: 200 },
  //   { month: 'February', Smartphones: 1900, Laptops: 1200, Tablets: 400 },
  //   { month: 'March', Smartphones: 400, Laptops: 1000, Tablets: 200 },
  //   { month: 'April', Smartphones: 1000, Laptops: 200, Tablets: 800 },
  //   { month: 'May', Smartphones: 800, Laptops: 1400, Tablets: 1200 },
  //   { month: 'June', Smartphones: 750, Laptops: 600, Tablets: 1000 },
  // ]
  // name: 'Smartphones', color: 'violet.6'

  useEffect(() => {
    cargarData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async ()=>{
    const ped = await getReg('vw_pedido','id_pedido',false);
    const prod = await getReg('producto','id_producto',false);
    const tran = await getRegFilter('vw_transaccion','fecha_entrega',dayjs(dayjs().startOf('month')).format('YYYY-MM-DD 04:00:00'),'between',dayjs(dayjs().endOf('month')).format('YYYY-MM-DD 23:59:59'))
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
    setPedidosDia(pivotDia)
    // obtenerReporte('UNO',listaProductos)
    console.log('listaProductos',listaProductos,pivot,pivotDia);
  }

  const obtenerReporte = async (tipo,data) =>{
    console.log('obteneinedo report',tipo,data);
    setLoading(true)
    try {
      // const response = await axios.get(`/api/reports`, {
      //   params: { tipo }
      // });
      // const response2 = await axios.post('/api/reports', [{a:1,b:25,c:23},{a:10,b:250,c:230},{a:15,b:255,c:235}], {
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      const templateData = {
        filename: 'report-template.docx', // Cambia el nombre de la plantilla según tu caso
      };
      // const data = [
      //   { id: 1, name: 'Item 1', value: 'Value 1' },
      //   { id: 2, name: 'Item 2', value: 'Value 2' },
      //   // Puedes agregar más objetos aquí
      // ];
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
    // const r = await generarReporte.bind(tipo)
    // const s = await handler.bind('x');
    // console.log('facil',r,s);
  }


  // const generarReporte = (tipoReporte) =>{
  //   const pathTemplate = ``
  //   const optionsReport = {
  //     convertTo : 'pdf', //can be docx, txt, ...
  //     reportName:  `Cristales_report${tipoReporte}_${new Date().getTime()}.pdf`, //'Reporte01' + new Date().getTime() + '.pdf',
  //     lang: "es",
  //     timezone: "America/Caracas",
  //   };
  //   const miData = transacciones
  //   try {
  //     render(
  //       pathTemplate,
  //       miData,
  //       optionsReport,
  //       (err, buffer, filename) => {
  //         if (err) console.log(err);
  //         if (!buffer) console.log('sin buffer',err);
  //         console.log('el buff',buffer,filename);
  //         const result = Buffer.from(buffer, 'binary');
  //         const url = window.URL.createObjectURL(new Blob([result]));
  //         const link = document.createElement("a");
  //         link.href = url;
  //         link.setAttribute("download", nombreReporte);
  //         document.body.appendChild(link);
  //         link.click();

  //         document.body.removeChild(link);
  //         URL.revokeObjectURL(url);
  //       }
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     respuesta.send(error);
  //   }
  // }

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Datos del {dayjs().startOf('month').format('DD MMM YYYY')} al {dayjs().endOf('month').format('DD MMM YYYY')}
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <div style={{display:'flex', justifyContent:'space-between',marginBottom:'1rem'}}>
          <Box style={{display:'flex',justifyContent:'flex-start',gap:'1rem',margin:'1rem 0'}}>
            <Button color='green.5' variant='light' onClick={()=>obtenerReporte('DOS',transacciones)} size='sm' style={{marginTop:'1.5rem'}}> Histórico Pedidos</Button>
          </Box>
          <Box style={{display:'flex',justifyContent:'flex-end',gap:'1rem',margin:'1rem 0'}}>
            <DatePickerInput
              value={f1}
              onChange={setF1}
              label="Fecha Inicio"
              placeholder="Fecha Inicio"
              size='sm'
              valueFormat='DD MMM YYYY'
            />
            <DatePickerInput
              value={f2}
              onChange={setF2}
              label="Fecha Fin"
              placeholder="Fecha Fin"
              size='sm'
              valueFormat='DD MMM YYYY'
            />
            <Button color='blue.2' variant='light' onClick={()=>cargarData()} size='sm' style={{marginTop:'1.5rem'}} >Cargar Transacciones</Button>
          </Box>
        </div>
        <Box style={{display:'flex', gap:'1rem',gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))'}}>
          <BarChart
            h={300}
            data={productos}
            dataKey="descripcion"
            series={[{name:'existencia',color:'teal.6'}]}
            tickLine="y"
          />
          <BarChart
            h={300}
            data={listaPedidos}
            dataKey="cliente"
            series={[{name:'monto_pago',color:'orange.4'}]}
            tickLine="y"
          />
        </Box>
        <LineChart
        style={{marginTop:'1rem'}}
          h={400}
          data={pedidosDia}
          dataKey="fecha_entrega"
          series={[{ name: 'cantidad_entregada', color: 'indigo.4' }]}
          curveType="bump"
          connectNulls
        />
      </Box>
    </div>
  )
}

export default Page