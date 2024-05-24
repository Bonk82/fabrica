'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconAlignLeft, IconBox, IconCalendar, IconCheck, IconDeviceFloppy, IconEdit, IconEye, IconFileBarcode, IconFolder, IconPlusMinus, IconReceipt2, IconRefresh, IconStack2, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
const Page = () => {
  const { loading,usuario,createReg,pedidos,clientes,productos,getReg,updateReg,deleteReg } = useSupa();
  const [id, setId] = useState(null)

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('vw_pedido','id_pedido',false);
    await getReg('cliente','id_cliente',false);
    await getReg('producto','id_producto',false);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      codigo:'',
      descripcion:'',
      unidad:'',
      existencia:'',
      precio:'',
      promocion: '',
      pedido_minimo:''
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });

  const toast = (title,message,type) =>{
    // return <Toast title='el totulo' message='el mensaje' type='error'/>
    let color = type
    if(type == 'success') color = 'lime.8';
    if(type == 'info') color = 'cyan.8';
    if(type == 'warning') color = 'yellow.8';
    if(type == 'error') color = 'red.8';
    notifications.show({
      title,
      message,
      color,
      classNames: classes,
    })
  }

  const registrarPedido = async (data) => {
    // event.preventDefault();
    console.log('la data',data);
    const newPedido = {
      ...data,
      usuario_registro:usuario?.id,
      fecha_registro:new Date(),
      activo:1
    }
    console.log('new pedido',newPedido,id);
    try {
      id ? await updateReg('pedido',newPedido) : await createReg(newPedido,'pedido');
      cargarData();
      toast('Control Pedido',`Pedido ${id? 'actualziado': 'registrado'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Pedido',error.message || error,'error')
      console.log(error);
    }finally{
      form.reset();
      setId(null)
    }
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR el pedido: <strong>{e.id_pedido}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Pedido', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeletePedido(e),
    });
  }

  const onDeletePedido = async(e) => {
    console.log('delete pedido',e);
    try {
      await deleteReg('pedido',e.id_pedido);
      toast('Control Pedido',`Pedido eliminado satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Pedido',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    setId(data.id_producto);
    form.setValues(data)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id_pedido',
        header: 'Número',
      },
      {
        accessorKey: 'fid_cliente',
        header: 'Cliente',
      },
      {
        accessorKey: 'fid_producto',
        header: 'Producto',
      },
      {
        accessorKey: 'fecha_entrega',
        header: 'Fecha Entrega:',
      },
      {
        accessorKey: 'cantidad_solicitada',
        header: 'Cantidad Solicitada',
      },
      {
        accessorKey: 'precio',
        header: 'Precio',
      },
      {
        accessorKey: 'descuento',
        header: 'Descuento',
      },
      {
        accessorKey: 'cantidad_entregada',
        header: 'Cantidad Entregada',
      },
      {
        accessorKey: 'estado_pedido',
        header: 'Estado Pedido',
      },
      {
        accessorKey: 'monto_pago',
        header: 'Monto Pago',
      },
      {
        accessorKey: 'estado_pago',
        header: 'Estado Pago',
      },
      {
        accessorKey: 'fecha_pago',
        header: 'Fecha Pago',
      },
      {
        accessorKey: 'metodo_pago',
        header: 'Método Pago',
      },
      {
        accessorKey: 'metodo_entrega',
        header: 'Método Entrega',
      },
      {
        accessorKey: 'fecha_registro',
        header: 'Fecha Pedido',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: pedidos, 
    defaultColumn: {
      minSize: 50, 
      maxSize: 200, 
      size: 100,
    },
    initialState: {
      density: 'xs',
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box>
        <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)}>
          <IconEdit color='orange' />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
          <IconTrash color='red' />
        </ActionIcon>
      </Box>
    ),
    mantineTableHeadCellProps:{
      color:'cyan'
    },
    mantineTableProps:{
      striped: true,
    },
    localization:MRT_Localization_ES
  });


  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Pedidos
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: 'lg', blur: 2 }}
          loaderProps={{ color: 'indigo', type: 'bars' }}
        />
        <form onSubmit={form.onSubmit((values) => registrarPedido(values))}>
          <TextInput
            label="Número Pedido:"
            key={form.key('id_pedido')}
            type='number'
            readOnly
            leftSection={<IconFileBarcode size={16} />}
            {...form.getInputProps('id_pedido')}
          />
          {/* <NativeSelect
            label="Cliente:"
            data={[clientes.forEach(c => {
              return({
                label:c.nombre,value:c.id_cliente
              })
            })]}
            key={form.key('fid_cliente')}
            leftSection={<IconBox size={16} />}
            {...form.getInputProps('fid_cliente')}
          />
          <NativeSelect
            label="Producto:"
            data={[clientes.forEach(c => {
              return({
                label:c.descripcion,value:c.id_producto
              })
            })]}
            leftSection={<IconBox size={16} />}
            key={form.key('fid_producto')}
            {...form.getInputProps('fid_producto')}
          /> */}
          <TextInput
            label="Fecha Entrega:"
            placeholder='Fecha Entrega'
            type='date'
            leftSection={<IconAlignLeft size={16} />}
            key={form.key('fecha_entrega')}
            {...form.getInputProps('fecha_entrega')}
          />
          <NumberInput
            label="Cantidad Solicitada:"
            placeholder="10"
            allowDecimal={false}
            max={500}
            min={1}
            leftSection={<IconPlusMinus size={16} />}
            key={form.key('cantidad_solicitada')}
            {...form.getInputProps('cantidad_solicitada')}
          />
          <NumberInput
            label="Precio:"
            placeholder="Precio normal de venta"
            prefix='Bs. '
            defaultValue={0.00}
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator=','
            leftSection={<IconReceipt2 size={16} />}
            key={form.key('precio')}
            {...form.getInputProps('precio')}
          />
          <NumberInput
            label="Descuento:"
            placeholder="Descuento al precio normal"
            prefix='Bs. '
            defaultValue={0.00}
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator=','
            leftSection={<IconReceipt2 size={16} />}
            key={form.key('descuento')}
            {...form.getInputProps('descuento')}
          />
          <NumberInput
            label="Cantidad Entregada:"
            placeholder="10"
            allowDecimal={false}
            max={500}
            min={1}
            leftSection={<IconPlusMinus size={16} />}
            key={form.key('cantidad_entregada')}
            {...form.getInputProps('cantidad_entregada')}
          />
          <NativeSelect
            label="Estado Pedido:"
            data={['Solicitado', 'Entegado', 'Pendiente']}
            leftSection={<IconFolder size={16} />}
            key={form.key('estado_pedido')}
            {...form.getInputProps('estado_pedido')}
          />
          <NumberInput
            label="Monto Pago:"
            placeholder="Monto pago"
            prefix='Bs. '
            defaultValue={0.00}
            decimalScale={2}
            fixedDecimalScale
            thousandSeparator=','
            leftSection={<IconReceipt2 size={16} />}
            key={form.key('monto_pago')}
            {...form.getInputProps('monto_pago')}
          />
          <NativeSelect
            label="Estado Pago:"
            data={['Pagado', 'Pendiente', 'Descuento']}
            leftSection={<IconFolder size={16} />}
            key={form.key('estado_pago')}
            {...form.getInputProps('estado_pago')}
          />
          <TextInput
            label="Fecha Pago:"
            placeholder='Fecha Pago'
            type='date'
            leftSection={<IconCalendar size={16} />}
            key={form.key('fecha_pago')}
            {...form.getInputProps('fecha_pago')}
          />
          <NativeSelect
            label="Método Pago:"
            data={['Contado', 'Descuento', 'QR','Transferencia']}
            leftSection={<IconFolder size={16} />}
            key={form.key('metodo_pago')}
            {...form.getInputProps('metodo_pago')}
          />
          <NativeSelect
            label="Método Entrega:"
            data={['En fábrica', 'Delivery', 'Envío','Entrega programada']}
            leftSection={<IconFolder size={16} />}
            key={form.key('metodo_entrega')}
            {...form.getInputProps('metodo_entrega')}
          />
          <TextInput
            label="Fecha Pedido:"
            placeholder='Fecha Pedido'
            type='date'
            leftSection={<IconCalendar size={16} />}
            key={form.key('fecha_registro')}
            {...form.getInputProps('fecha_registro')}
          />
          <Group justify="flex-end" mt="md">
            {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Pedido</Button>}
            {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Pedido</Button>}
          </Group>
        </form>

        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page