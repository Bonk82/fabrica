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

const Page = () => {
  const { loading,getReg,transacciones,pedidos,productos} = useSupa();
  const [listaProductos, setListaProductos] = useState([])
  const colores = ['violet.6','green.6','red.6'];

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

  return (
    <BarChart
      h={300}
      data={productos}
      dataKey="descripcion"
      series={[{name:'existencia',color:'violet.6'}]}
      tickLine="y"
    />
    // <h1>dashboard</h1>
  )
}

export default Page