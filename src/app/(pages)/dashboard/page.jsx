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
import { BarChart } from '@mantine/charts';
import dayjs from 'dayjs';
import { DatePickerInput } from '@mantine/dates';
import {render} from 'carbone'

const Page = () => {
  const { loading,getReg,getRegFilter,transacciones,pedidos,productos} = useSupa();
  const [listaProductos, setListaProductos] = useState([])
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
    getData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getData = async ()=>{
    await getReg('vw_pedido','id_pedido',false);
    await getReg('producto','id_producto',false);
    await getRegFilter('vw_transaccion','fecha',dayjs(f1).format('YYYY-MM-DD 04:00:00'),'between',dayjs(f2).format('YYYY-MM-DD 23:59:59'))
    armarData()
  }

  const armarData=()=>{
    console.log('productos',productos);
    console.log('transacciones',transacciones);
    console.log('pedidos',pedidos);
    productos.forEach((p,i) => {
      listaProductos.push({name:p.existencia,color:colores[i]})
    });
    console.log('listaProductos',listaProductos);
  }


  const generarReporte = (tipoReporte) =>{
    const pathTemplate = ``
    const optionsReport = {
      convertTo : 'pdf', //can be docx, txt, ...
      reportName:  `Cristales_report${tipoReporte}_${new Date().getTime()}.pdf`, //'Reporte01' + new Date().getTime() + '.pdf',
      lang: "es",
      timezone: "America/Caracas",
    };
    const miData = transacciones
    try {
      render(
        pathTemplate,
        miData,
        optionsReport,
        (err, buffer, filename) => {
          if (err) console.log(err);
          if (!buffer) console.log('sin buffer',err);
          console.log('el buff',buffer,filename);
          const result = Buffer.from(buffer, 'binary');
          const url = window.URL.createObjectURL(new Blob([result]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", nombreReporte);
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      );
    } catch (error) {
      console.log(error);
      respuesta.send(error);
    }
  }

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Datos del {dayjs().startOf('month').format('DD-MM-YYYY')} al {dayjs().endOf('month').format('DD-MM-YYYY')}
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
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
          <Button color='blue.2' variant='light' onClick={cargarTransaciones} size='sm' style={{marginTop:'1.5rem'}} >Cargar Transacciones</Button>
        </Box>
        <Box>
          <BarChart
            h={300}
            data={productos}
            dataKey="descripcion"
            series={[{name:'existencia',color:'teal.6'}]}
            tickLine="y"
          />
          <BarChart
            h={300}
            data={productos}
            dataKey="descripcion"
            series={[{name:'existencia',color:'teal.8'}]}
            tickLine="y"
          />
        </Box>
      </Box>
    </div>
  )
}

export default Page