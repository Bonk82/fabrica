'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Autocomplete, Box, Button, Center, Group, Kbd, LoadingOverlay, Modal, NativeSelect, NumberInput, Switch, Text, Textarea, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconAlignLeft, IconBox, IconCalendar, IconCar, IconCheck, IconDeviceFloppy, IconEdit, IconEye, IconFileBarcode, IconFolder, IconMessage, IconMoneybag, IconNumber, IconPlusMinus, IconProgressCheck, IconReceipt2, IconRefresh, IconStack2, IconTrash, IconUser } from '@tabler/icons-react';
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
  const { loading,usuario,createReg,parametricas,pedidos,pedidosDetalle,clientes,productos,getReg,getRegFilter,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [verDetalle, setVerDetalle] = useState(false);
  const [verGrillaDetalle, setVerGrillaDetalle] = useState(false);
  const [id, setId] = useState(null)
  const [idDetalle, setIdDetalle] = useState(null)
  const [listaClientes, setListaClientes] = useState([])
  const [listaProductos, setListaProductos] = useState([])
  const [elCliente, setElCliente] = useState('')
  const [elProducto, setElProducto] = useState('')
  const [facturado, setFacturado] = useState(false)

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hoy=dayjs().format('YYYY-MM-DD')
  
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
  const cargarDetallePedido = async (value) =>{
    console.log('¡lo q llega',value);
    await getRegFilter('vw_pedido_detalle','fid_pedido',value,'eq');
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
      factura:false,
      delivery:0,
      fecha_registro:null,
      observacion:'',
    },
    // validate: {
    //   tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    // },
  });
  const formDetalle = useForm({
    mode: 'uncontrolled',
    initialValues: {
      cantidad_solicitada:0,
      precio_unidad:0,
      cantidad_entregada:0,
      monto_total:0,
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
    data.observacion = data.observacion?.toUpperCase();
    if(!data.id_pedido) data.id_pedido = null;
    console.log('la data',data)
    let newPedido
    if(id){
      newPedido = {
        ...data,
        usuario_modifica:usuario?.id,
        fecha_modifica:dayjs().add(-4,'hours'),
      }
    }
    if(!id){
      newPedido = {
        ...data,
        usuario_registro:usuario?.id,
        fecha_registro:dayjs().add(-4,'hours'),
        activo:1
      }
      delete newPedido.id_pedido
      delete newPedido.fecha_pago
    }
    delete newPedido.nombre
    delete newPedido.direccion
    delete newPedido.referencia
    delete newPedido.telefonos
    delete newPedido.tipo_cliente
    
    newPedido.fid_cliente = clientes.filter(f=>f.nombre == data.nombre)[0]?.id_cliente;
    newPedido.fid_producto = productos.filter(f=>f.id_producto == elProducto)[0]?.id_producto;
    newPedido.factura = facturado;
    
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
  const registrarPedidoDetalle = async (data) => {
    console.log('la data',data,id,idDetalle);
    const newPedidoDetalle = data
    delete newPedidoDetalle.monto_total
    delete newPedidoDetalle.codigo
    delete newPedidoDetalle.descripcion
    delete newPedidoDetalle.precio
    delete newPedidoDetalle.promocion
    delete newPedidoDetalle.unidad
    delete newPedidoDetalle.pedido_minimo
    if(!idDetalle) delete newPedidoDetalle.id_pedido
    newPedidoDetalle.fid_producto = productos.filter(f=>f.id_producto == elProducto)[0]?.id_producto;
    newPedidoDetalle.fid_pedido = id
    
    console.log('new pedido_detalle',newPedidoDetalle,id,idDetalle);
    try {
      idDetalle ? await updateReg('pedido_detalle',newPedidoDetalle) : await createReg(newPedidoDetalle,'pedido_detalle');
      cargarDetallePedido(id);
      toast('Control Pedido',`Detalle ${idDetalle? 'actualziado': 'registrado'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Pedido',error.message || error,'error')
      console.log(error);
    }finally{
      formDetalle.reset();
      setVerDetalle(false)
      setIdDetalle(null)
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
      labels: { confirm: `Eliminar ${e.id_pedido ? 'Pedido' : 'Producto'}`, cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDelete(e),
    });
  }

  const onDelete = async(e) => {
    console.log('delete pedido',e);
    const tabla = e.id_pedido ? 'pedido':'pedido_detalle'
    const elId = e.id_pedido ? e.id_pedido:e.id_pedido_detalle
    try {
      await deleteReg(tabla,elId);
      toast('Control Pedido',`${e.id_pedido ? 'Pedido' : 'Producto'} eliminado satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Pedido',error.message || error,'error')
    } finally{
      e.id_pedido ? cargarData() : cargarDetallePedido(id)
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data,listaProductos);
    open()
    setId(data.id_pedido);
    setFacturado(data.factura);
    form.setValues(data)
    form.setFieldValue('estado_pedido','SOLICITADO')
    // setElProducto(data.fid_producto)
  }

  const mostrarRegistroDetalle = (data) =>{
    console.log('cargando data',data,listaProductos);
    setVerDetalle(true)
    setIdDetalle(data.id_pedido_detalle);
    setId(data.fid_pedido);
    formDetalle.setValues(data)
    setElProducto(data.fid_producto)
    formDetalle.setFieldValue('monto_total', (data.precio || 0) * data.cantidad_solicitada )
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
        accessorKey: 'factura',
        header: 'Facturado',
      },
      {
        accessorKey: 'delivery',
        header: 'Monto Delivery',
      },
      {
        accessorKey: 'fecha_registro',
        header: 'Fecha Pedido',
        Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY HH:mm:ss')}</span>
        )
      },
      {
        accessorKey: 'observacion',
        header: 'Observación',
      },
    ],
    [],
  );

  const colDetalle = useMemo(
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
          <span>
            {cell.getValue().toLocaleString('es-Es', { style: 'currency', currency: 'BOB'
            ,minimumFractionDigits: 2, maximumFractionDigits: 2, })}
          </span>
        )
      },
      {
        accessorKey: 'cantidad_entregada',
        header: 'Cantidad Entregada',
      },
    ],
    [],
  );

  const mostrarGrillaPedido = (data,tipo)=>{
    console.log('ladata',data);
    if(id == data.id_pedido && verGrillaDetalle){
      setVerGrillaDetalle(false)
      setId(null)
      return true
    }
    setId(data.id_pedido)
    setVerGrillaDetalle(true)
    cargarDetallePedido(data.id_pedido)
    // if(tipo=='nuevo') setVerDetalle(true)
    // if(tipo=='grilla') setVerGrillaDetalle(true)
  }
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
      columnPinning: {
        left: ['mrt-row-expand'],
      },
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <ActionIcon variant="subtle" onClick={() => mostrarGrillaPedido(row.original)} title='Ver detalle del pedido'>
          <IconEye color='skyblue'/>
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
    localization:MRT_Localization_ES,
    // enableColumnResizing:true,
    renderDetailPanel:({row}) => (
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
        }}
      >
        <h2>{row.original.nombre}</h2>
        <p>{row.original.direccion} {row.original.referencia}</p>
        <strong>{row.original.telefonos}</strong><br />
        <Kbd color='orange'>{row.original.tipo_cliente}</Kbd>
      </Box>
    )
  });

  const tableDetalle = useMantineReactTable({
    columns:colDetalle,
    data: pedidosDetalle, 
    defaultColumn: {
      minSize: 40, 
      maxSize: 100, 
      size: 60,
    },
    initialState: {
      density: 'xs',
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box style={{gap:'0.8rem',display:'flex'}}>
        <ActionIcon variant="subtle" onClick={() => mostrarRegistroDetalle(row.original)} title='Editar porducto en pedido'>
          <IconEdit color='orange' />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => confirmar(row.original)} title='Eliminar producto del pedido'>
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
    // formDetalle.setValues({precio:formDetalle.getValues().cantidad_solicitada * (elPrecio || 0)})
    formDetalle.setFieldValue('precio_unidad', elPrecio)
    formDetalle.setFieldValue('monto_total', (elPrecio || 0) * formDetalle.getValues().cantidad_entregada )
    setElProducto(v)
    console.log('handdlerProduct',elPrecio,formDetalle.getValues(),v);
  }

  const handdleCantidad = ()=>{
    const elPrecio =  formDetalle.getValues().precio_unidad;
    console.log('el precio',elPrecio,formDetalle.getValues());
    // form.setFieldValue('precio', form.getValues().cantidad_solicitada * (elPrecio || 0))
    formDetalle.setFieldValue('cantidad_entregada', formDetalle.getValues().cantidad_solicitada)
    formDetalle.setFieldValue('monto_total', (elPrecio || 0) * formDetalle.getValues().cantidad_entregada )
  }

  const handdlePrecio = ()=>{
    const elPrecio = formDetalle.getValues().precio_unidad;
    console.log('el precio',elPrecio,formDetalle.getValues());
    formDetalle.setFieldValue('monto_total', (elPrecio || 0) * formDetalle.getValues().cantidad_entregada )
  }

  const handdleEntregado = ()=>{
    const elPrecio = formDetalle.getValues().precio_unidad;
    console.log('el precio',elPrecio,formDetalle.getValues());
    formDetalle.setFieldValue('monto_total', (elPrecio || 0) * formDetalle.getValues().cantidad_entregada )
  }

  const nuevo = ()=>{
    open()
    setId(null)
    form.reset()
    form.setFieldValue('estado_pedido','SOLICITADO')
  }
  const nuevoDetalle = ()=>{
    console.log('nuevo detalle');
    setVerDetalle(true)
    setIdDetalle(null)
    // setId(value.id_pedido)
    formDetalle.reset()
    // formDetalle.setFieldValue('estado_pedido','SOLICITADO')
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
            <Autocomplete
              label="Cliente:"
              data={listaClientes}
              required
              withAsterisk
              limit={4}
              maxLength={100}
              leftSection={<IconUser size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            <TextInput
              label="Fecha Entrega:"
              placeholder='Fecha Entrega'
              type='date'
              required
              withAsterisk
              maxLength={15}
              min={hoy}
              leftSection={<IconCalendar size={16} />}
              key={form.key('fecha_entrega')}
              {...form.getInputProps('fecha_entrega')}
            />
            <NumberInput
              label="Descuento:"
              placeholder="Descuento al precio normal"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              maxLength={15}
              leftSection={<IconReceipt2 size={16} />}
              key={form.key('descuento')}
              {...form.getInputProps('descuento')}
            />
            <NativeSelect
              label="Estado Pedido:"
              // data={['SOLICITADO', 'PENDIENTE', 'ENTREGADO']}
              data={parametricas.filter(f=>f.tipo === 'ESTADO_PEDIDO').map(e=>e.nombre)}
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
              maxLength={15}
              leftSection={<IconReceipt2 size={16} />}
              key={form.key('monto_pago')}
              {...form.getInputProps('monto_pago')}
            />
            <NativeSelect
              label="Estado Pago:"
              data={['SELECCIONE...','PENDIENTE','PAGADO']}
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
              maxLength={10}
              leftSection={<IconCalendar size={16} />}
              key={form.key('fecha_pago')}
              {...form.getInputProps('fecha_pago')}
            />
            <NativeSelect
              label="Método Pago:"
              // data={['EFECTIVO', 'DESCUENTO', 'QR','TRASNFERENCIA','TARJETA']}
              data={parametricas.filter(f=>f.tipo === 'METODO_PAGO').map(e=>e.nombre)}
              leftSection={<IconFolder size={16} />}
              key={form.key('metodo_pago')}
              {...form.getInputProps('metodo_pago')}
            />
            <NativeSelect
              label="Método Entrega:"
              // data={['EN FABRICA', 'DELIVERY', 'ENVÍO','ENTREGA PROGRAMDA']}
              data={parametricas.filter(f=>f.tipo === 'METODO_ENTREGA').map(e=>e.nombre)}
              leftSection={<IconFolder size={16} />}
              key={form.key('metodo_entrega')}
              {...form.getInputProps('metodo_entrega')}
            />
            <Switch size="lg" onLabel="SI" offLabel="NO"
              label="Pedido con Factura:"
              style={{marginTop:'0.5rem'}}
              checked={facturado}
              onChange={(event) => setFacturado(event.currentTarget.checked)}
            />
            <NumberInput
              label="Monto Delivery:"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              maxLength={15}
              leftSection={<IconCar size={16} />}
              key={form.key('delivery')}
              {...form.getInputProps('delivery')}
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
            <Textarea
              label="Observación:"
              placeholder='La observacion sobre el pedido'
              leftSection={<IconMessage size={16} />}
              rows={2}
              key={form.key('observacion')}
              {...form.getInputProps('observacion')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Pedido</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Pedido</Button>}
            </Group>
          </form>
        </Modal>

        <Modal opened={verDetalle} onClose={()=>setVerDetalle(false)} title={idDetalle?'Actualizar Detalle: '+ idDetalle:'Registrar Detalle'}
          size='md' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={formDetalle.onSubmit((values) => registrarPedidoDetalle(values))}>
            <NativeSelect
              label="Producto:"
              data={listaProductos}
              leftSection={<IconBox size={16} />}
              value={elProducto}
              onChange={e=>handdlerProduct(e.currentTarget.value)}
            />
            <NumberInput
              label="Cantidad Solicitada:"
              placeholder="10"
              allowDecimal={false}
              max={500}
              min={1}
              required
              onValueChange={handdleCantidad}
              maxLength={15}
              leftSection={<IconProgressCheck size={16} />}
              key={formDetalle.key('cantidad_solicitada')}
              {...formDetalle.getInputProps('cantidad_solicitada')}
            />
            <NumberInput
              label="precio_unidad:"
              placeholder="precio_unidad"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              leftSection={<IconReceipt2 size={16} />}
              required
              onValueChange={handdlePrecio}
              maxLength={15}
              key={formDetalle.key('precio_unidad')}
              {...formDetalle.getInputProps('precio_unidad')}
            />
            <NumberInput
              label="Cantidad Entregada:"
              allowDecimal={false}
              max={500}
              min={1}
              maxLength={15}
              onValueChange={handdleEntregado}
              required
              leftSection={<IconProgressCheck size={16} />}
              key={formDetalle.key('cantidad_entregada')}
              {...formDetalle.getInputProps('cantidad_entregada')}
            />
            <NumberInput
              label="Monto total producto:"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              readOnly
              leftSection={<IconMoneybag size={16} />}
              key={formDetalle.key('monto_total')}
              {...formDetalle.getInputProps('monto_total')}
            />
            <Group justify="flex-end" mt="md">
              {!idDetalle && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Detalle</Button>}
              {idDetalle && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Detalle</Button>}
            </Group>
          </form>
        </Modal>

        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nuevo Pedido</Button>

        <MantineReactTable table={table} />

        {verGrillaDetalle && <Box>
          <Button onClick={nuevoDetalle} style={{margin:'1rem 0'}} size='sm'>Agregar Producto</Button>

          <MantineReactTable table={tableDetalle} />
        </Box>}
      </Box>
    </div>
  )
}

export default Page