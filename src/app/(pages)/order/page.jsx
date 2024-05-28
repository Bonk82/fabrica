'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Autocomplete, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Select, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconAlignLeft, IconBox, IconCalendar, IconCheck, IconDeviceFloppy, IconEdit, IconEye, IconFileBarcode, IconFolder, IconPlusMinus, IconReceipt2, IconRefresh, IconStack2, IconTrash, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';


const Page = () => {
  const { loading,usuario,createReg,pedidos,clientes,productos,getReg,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)
  const [listaClientes, setListaClientes] = useState([])
  const [listaProductos, setListaProductos] = useState([])
  const [elCliente, setElCliente] = useState('')
  const [elProducto, setElProducto] = useState('')

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('vw_pedido','id_pedido',false);
    let pivotClientes = await getReg('cliente','id_cliente',false);
    let pivotProductos = await getReg('producto','id_producto',false);
    pivotClientes = pivotClientes.map(c => c.nombre);
    setListaClientes(pivotClientes);
    pivotProductos = pivotProductos.map(p => {
      p.label = p.descripcion;
      p.value = p.id_producto;
      return p;
    });
    // pivotProductos = pivotProductos.map(p => p.descripcion);
    setListaProductos(pivotProductos);
    console.log('revisando listas',listaClientes,listaProductos,pivotClientes,pivotProductos);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      id_pedido:null,
      nombre:'',
      fecha_entrega:null,
      descuento:0,
      estado_pedido:'',
      monto_pago:0,
      estado_pago:'',
      fecha_pago:null,
      metodo_pago: '',
      metodo_entrega:'',
      fecha_registro:null,
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });
  const form_detalle = useForm({
    mode: 'uncontrolled',
    initialValues: {
      descripcion:'',
      nombre:'',
      cantidad_solicitada:0,
      precio_unidad:0,
      cantidad_entregada:0,
    }
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
    if(!data.id_pedido) data.id_pedido = null;
    console.log('la data',data);
    const newPedido = {
      ...data,
      usuario_registro:usuario?.id,
      fecha_registro:dayjs().format('YYYY-MM-DD HH:mm:ss'),
      activo:1
    }
    if(!id){
      delete newPedido.id_pedido
      delete newPedido.fecha_pago
    }
    if(id){
      newPedido.usuario_modifica = usuario?.id
      newPedido.fecha_modifica = dayjs().format('YYYY-MM-DD HH:mm:ss')
      delete newPedido.usuario_registro
      delete newPedido.fecha_registro
    }
    delete newPedido.nombre
    delete newPedido.direccion
    delete newPedido.referencia
    delete newPedido.telefonos
    delete newPedido.tipo_cliente
    // delete newPedido.codigo
    // delete newPedido.descripcion
    // delete newPedido.unidad
    // delete newPedido.precio
    // delete newPedido.promocion
    // delete newPedido.pedido_minimo
    
    newPedido.fid_cliente = clientes.filter(f=>f.nombre == data.nombre)[0]?.id_cliente;
    newPedido.fid_producto = productos.filter(f=>f.id_producto == elProducto)[0]?.id_producto;
    
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
      close()
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
    console.log('cargando data',data,listaProductos);
    open()
    setId(data.id_pedido);
    form.setValues(data)
    setElProducto(data.fid_producto)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id_pedido',
        header: 'Número Pedido',
      },
      {
        accessorKey: 'nombre',
        header: 'Cliente',
      },
      {
        accessorKey: 'fecha_entrega',
        header: 'Fecha Entrega:',
        Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY')}</span>
        )
      },
      {
        accessorKey: 'descuento',
        header: 'Descuento',
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
        Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY HH:mm:ss')}</span>
        )
      },
    ],
    [],
  );

  const col_detalle = useMemo(
    () => [
      {
        accessorKey: 'fid_pedido',
        header: 'Número Pedido',
      },
      {
        accessorKey: 'descripcion',
        header: 'Producto',
      },
      {
        accessorKey: 'cantidad_solicitada',
        header: 'Cantidad Solicitada',
      },
      {
        accessorKey: 'precio_unidad',
        header: 'Precio Unitario',
        Cell:({cell})=>(
          <span>{cell.getValue()?.toLocaleString('es-Es', { style: 'currency', currency: 'BOB' })}</span>
        )
      },
      {
        accessorKey: 'cantidad_entregada',
        header: 'Cantidad Entregada',
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
      <Box style={{gap:'1rem'}}>
        <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)} title='Detalle Pedido'>
          <IconEye color='skyblue' />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => mostrarRegistro(row.original)} title='Editar Pedido'>
          <IconEdit color='orange' />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => confirmar(row.original)} title='Eliminar Pedido'>
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

  const handdlerProduct = (v)=>{
    const elPrecio =  productos.filter(f=> f.id_producto == v)[0]?.precio;
    console.log('el precio',elPrecio,form.getValues(),v);
    form.setValues({precio:form.getValues().cantidad_solicitada * (elPrecio || 0)})
    setElProducto(v)
  }

  const handdleCantidad = ()=>{
    const elPrecio =  productos.filter(f=> f.id_producto == elProducto)[0]?.precio;
    console.log('el precio',elPrecio,form.getValues());
    form.setFieldValue('precio', form.getValues().cantidad_solicitada * (elPrecio || 0))
  }

  const nuevo = ()=>{
    open()
    setId(null)
    form.reset()
    form.setFieldValue('estado_pedido','SOLICITADO')
  }


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
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={id?'Actualizar Pedido: '+ id:'Registrar Pedido'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarPedido(values))}>
            {/* <TextInput
              label="Número Pedido:"
              key={form.key('id_pedido')}
              type='number'
              readOnly
              leftSection={<IconFileBarcode size={16} />}
              {...form.getInputProps('id_pedido')}
            /> */}
            {/* <Autocomplete
              label="Cliente:"
              // data={['uno','dos','tres','cuatro','cinco','seis','siete']}
              data={listaClientes}
              required
              withAsterisk
              limit={4}
              id='cliente'
              // onChange={(value)=>actualizarPrecio(value)}
              onValueChange={actualizarPrecio}
              leftSection={<IconBox size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            /> */}
            <Autocomplete
              label="Cliente:"
              // data={['uno','dos','tres','cuatro','cinco','seis','siete']}
              data={listaClientes}
              required
              withAsterisk
              limit={4}
              // value={elCliente}
              // onChange={actualizarPrecio}
              leftSection={<IconUser size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            {/* <NativeSelect
              label="Producto:"
              data={listaProductos}
              leftSection={<IconBox size={16} />}
              value={elProducto}
              onChange={e=>handdlerProduct(e.currentTarget.value)}
              // onChangeCapture={e=>actualizarPrecio(e)}
              // key={form.key('fid_producto')}
              // {...form.getInputProps('fid_producto')}
            /> */}
            {/* <Autocomplete
              label="Producto:"
              // data={['uno','dos','tres','cuatro','cinco','seis','siete']}
              data={listaProductos}
              required
              limit={4}
              value={elProducto}
              onChange={handdlerProduct}
              leftSection={<IconBox size={16} />}
              // key={form.key('nombre')}
              // {...form.getInputProps('nombre')}
            /> */}
            <TextInput
              label="Fecha Entrega:"
              placeholder='Fecha Entrega'
              type='date'
              required
              withAsterisk
              leftSection={<IconAlignLeft size={16} />}
              key={form.key('fecha_entrega')}
              {...form.getInputProps('fecha_entrega')}
            />
            {/* <NumberInput
              label="Cantidad Solicitada:"
              placeholder="10"
              allowDecimal={false}
              max={500}
              min={1}
              leftSection={<IconPlusMinus size={16} />}
              required
              withAsterisk
              onValueChange={handdleCantidad}
              key={form.key('cantidad_solicitada')}
              {...form.getInputProps('cantidad_solicitada')}
            /> */}
            {/* <NumberInput
              label="precio_unidad:"
              placeholder="precio_unidad"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              leftSection={<IconReceipt2 size={16} />}
              required
              withAsterisk
              key={form.key('precio_unidad')}
              {...form.getInputProps('precio_unidad')}
            /> */}
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
            {/* <NumberInput
              label="Cantidad Entregada:"
              placeholder="10"
              allowDecimal={false}
              max={500}
              min={1}
              leftSection={<IconPlusMinus size={16} />}
              key={form.key('cantidad_entregada')}
              {...form.getInputProps('cantidad_entregada')}
            /> */}
            <NativeSelect
              label="Estado Pedido:"
              data={['Solicitado', 'Pendiente', 'Entegado']}
              required
              withAsterisk
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
              value={0}
              leftSection={<IconReceipt2 size={16} />}
              key={form.key('monto_pago')}
              {...form.getInputProps('monto_pago')}
            />
            <NativeSelect
              label="Estado Pago:"
              data={['Pendiente','Pagado', 'Descuento']}
              required
              withAsterisk
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
              readOnly
              leftSection={<IconCalendar size={16} />}
              key={form.key('fecha_registro')}
              {...form.getInputProps('fecha_registro')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Pedido</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Pedido</Button>}
            </Group>
          </form>
        </Modal>

        <Button onClick={nuevo} style={{marginBottom:'2rem'}} size='sm'>Nuevo Pedido</Button>

        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page