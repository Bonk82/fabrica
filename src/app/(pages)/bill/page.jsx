'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import {  IconBubble, IconCalendar, IconCashBanknote, IconCode, IconDeviceFloppy, IconEdit, IconGps, IconRefresh, IconSection, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import { DateInput, DatePickerInput } from '@mantine/dates';

const Page = () => {
  const { loading,usuario,createReg,cuentas,parametricas,transacciones,getReg,getRegFilter,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [verTrans, setVerTrans] = useState(false)
  const [id, setId] = useState(null)
  const [idTrans, setIdTrans] = useState(null)
  const [f1, setF1] = useState(dayjs().startOf('month'))
  const [f2, setF2] = useState(dayjs().endOf('month'))

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('cuenta','id_cuenta',true);
    await getRegFilter('vw_transaccion','fecha',dayjs(f1).format('YYYY-MM-DD 04:00:00'),'between',dayjs(f2).format('YYYY-MM-DD 23:59:59'))
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      codigo:'',
      descripcion:'',
      categoria:'',
      tipo_cuenta:'',
      saldo:0,
    },
  });

  const formTrans = useForm({
    mode: 'uncontrolled',
    initialValues: {
      // categoria_cuenta:'',
      // tipo_cuenta:'',
      concepto:'',
      nombre_cuenta:'',
      // cliente:'',
      // tipo_cliente:'',
      fecha:'',
      // cantidad_entregada:0,
      // producto:'',
      monto:0,
      // descuento:0,
      // fecha_entrega:'',
      // metodo_pago:'',
      // metodo_entrega:'',
      // zona:''
    },
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

  const registrarCuenta = async (data) => {
    // event.preventDefault();
    data.codigo=data.codigo?.toUpperCase(),
    data.descripcion=data.descripcion?.toUpperCase(),
    console.log('la data',data);
    let newCuenta
    if(id){
      newCuenta = {
        ...data,
        usuario_modifica:usuario?.id,
        fecha_modifica:dayjs().add(-4,'hours'),
      }
    }
    if(!id){
      newCuenta = {
        ...data,
        usuario_registro:usuario?.id,
        fecha_registro:dayjs().add(-4,'hours'),
        activo:1
      }
    }
    console.log('new cuenta',newCuenta,id);
    try {
      id ? await updateReg('cuenta',newCuenta) : await createReg(newCuenta,'cuenta');
      cargarData();
      toast('Control Cuenta',`Cuenta ${id? 'actualziada': 'registrada'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Cuenta',error.message || error,'error')
      console.log(error);
    }finally{
      form.reset();
      close()
      setId(null)
    }
  }

  const registrarTransaccion = async (data) => {
    data.concepto=data.concepto?.toUpperCase(),
    data.usuario_registro = usuario?.id
    data.fid_cuenta = cuentas.filter(f=>f.descripcion == data.nombre_cuenta)[0]?.id_cuenta;
    if(idTrans) data.id_transaccion = idTrans
    delete data.nombre_cuenta
    console.log('la data',data);
    console.log('new transacaacion',data,id);
    try {
      idTrans ? await updateReg('transaccion',data) : await createReg(data,'transaccion');
      cargarData();
      toast('Control Transaccion',`Transaccion ${idTrans? 'actualziada': 'registrada'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Transaccion',error.message || error,'error')
      console.log(error);
    }finally{
      formTrans.reset();
      setVerTrans(false)
      setIdTrans(null)
    }
  }

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR la {e.id_transaccion ? 'transacción':'cuenta'}: <strong>{e.id_transaccion ? e.concepto.toUpperCase(): e.descripcion.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: `Eliminar ${e.id_transaccion ? 'Transacción':'Cuenta'}`, cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDelete(e),
    });
  }

  const onDelete = async(e) => {
    console.log('delete',e);
    const tabla = e.id_cuenta ? 'cuenta':'transaccion'
    const elId = e.id_cuenta ? e.id_cuenta:e.id_transaccion
    try {
      await deleteReg(tabla,elId);
      toast('Control Cuenta',`${e.id_cuenta ? 'Cuenta' : 'Transacción'} eliminada satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Cuenta',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    open()
    setId(data.id_cuenta);
    form.setValues(data)
  }

  const mostrarTransaccion = (data) =>{
    const soloTrans={
      nombre_cuenta:data.nombre_cuenta,
      fecha:dayjs(data.fecha).isValid() ? dayjs(data.fecha).format('YYYY-MM-DD HH:mm:ss') : null,
      monto:data.monto,
      concepto:data.concepto,
    }
    console.log('cargando data',data);
    setVerTrans(true)
    setIdTrans(data.id_transaccion);
    formTrans.setValues(soloTrans)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'codigo',
        header: 'Código',
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
      },
      {
        accessorKey: 'categoria',
        header: 'Categoría',
      },
      {
        accessorKey: 'tipo_cuenta',
        header: 'Tipo de Cuenta',
      },
      {
        accessorKey: 'saldo',
        header: 'Saldo Actual',
      },
    ],
    [],
  );

  const colTrans = useMemo(
    () => [
      {
        accessorKey: 'categoria_cuenta',
        header: 'Categoría Cuenta',
      },
      {
        accessorKey: 'tipo_cuenta',
        header: 'Tipo Cuenta',
      },
      {
        accessorKey: 'nombre_cuenta',
        header: 'Nombre Cuenta',
      },
      {
        accessorKey: 'cliente',
        header: 'Cliente',
      },
      {
        accessorKey: 'tipo_cliente',
        header: 'Tipo Cliente',
      },
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY HH:mm:ss')}</span>
        )
      },
      {
        accessorKey: 'cantidad_entregada',
        header: 'Cantidad Entregada',
      },
      {
        accessorKey: 'producto',
        header: 'Producto',
      },
      {
        accessorKey: 'monto',
        header: 'Monto',
      },
      {
        accessorKey: 'descuento',
        header: 'Descuento',
      },
      {
        accessorKey: 'fecha_entrega',
        header: 'Fecha Entrega',
        Cell:({cell})=>(
          <span>{dayjs(cell.getValue()).format('DD/MM/YYYY HH:mm:ss')}</span>
        )
      },
      {
        accessorKey: 'metodo_pago',
        header: 'Metodo Pago',
      },
      {
        accessorKey: 'Metodo Entrega',
        header: 'Metodo Entrega',
      },
      {
        accessorKey: 'zona',
        header: 'Zona',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: cuentas, 
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
      <Box style={{gap:'0.8rem',display:'flex'}}>
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

  const tableTrans = useMantineReactTable({
    columns:colTrans,
    data: transacciones, 
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
      <Box style={{gap:'0.8rem',display:'flex'}}>
        {!row.original.fid_pedido && <ActionIcon variant="subtle" onClick={() => mostrarTransaccion(row.original)}>
          <IconEdit color='orange' />
        </ActionIcon>}
        {!row.original.fid_pedido && <ActionIcon variant="subtle" onClick={() => confirmar(row.original)}>
          <IconTrash color='red' />
        </ActionIcon>}
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

  const nuevo = ()=>{
    open()
    setId(null)
    form.reset()
  }
  const nuevoTrans = ()=>{
    setVerTrans(true)
    setIdTrans(null)
    formTrans.reset()
  }

  const cargarTransaciones = ()=>{
    console.log('las fechas',f1,f2);
    cargarData();
  }

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Cuentas
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={idTrans?'Actualizar Cuenta: '+ idTrans:'Registrar Cuenta'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarCuenta(values))}>
            <TextInput
              label="Código:"
              placeholder="325001"
              type='text'
              maxLength={15}
              leftSection={<IconCode size={16} />}
              key={form.key('codigo')}
              {...form.getInputProps('codigo')}
            />
            <TextInput
              label="Descripción:"
              placeholder="Nombre de la cuenta"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('descripcion')}
              {...form.getInputProps('descripcion')}
            />
            <NativeSelect
              label="Categoría:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.tipo === 'CAT_CUENTA').map(e=>e.nombre)]}
              required
              leftSection={<IconSection size={16} />}
              key={form.key('categoria')}
              {...form.getInputProps('categoria')}
            />
            <NativeSelect
              label="Tipo Cuenta:"
              data={['SELECCIONE...',...parametricas.filter(f=>f.tipo === 'TIPO_CUENTA').map(e=>e.nombre)]}
              required
              leftSection={<IconSection size={16} />}
              key={form.key('tipo_cuenta')}
              {...form.getInputProps('tipo_cuenta')}
            />
            <NumberInput
              label="Saldo:"
              placeholder="0"
              readOnly
              leftSection={<IconCashBanknote size={16} />}
              key={form.key('saldo')}
              {...form.getInputProps('saldo')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Cuenta</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Cuenta</Button>}
            </Group>
          </form>
        </Modal>
        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nueva Cuenta</Button>
        <MantineReactTable table={table} />

        <Modal opened={verTrans} onClose={()=>setVerTrans(false)} title={idTrans?'Actualizar Transacción: '+ idTrans:'Registrar Transacción'}
          size='md' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={formTrans.onSubmit((values) => registrarTransaccion(values))}>
            <NativeSelect
              label="Cuenta:"
              data={['SELECCIONE...',...cuentas.map(e=>e.descripcion)]}
              required
              leftSection={<IconSection size={16} />}
              key={formTrans.key('nombre_cuenta')}
              {...formTrans.getInputProps('nombre_cuenta')}
            />
            <TextInput
              label="Fecha:"
              placeholder="Fecha de la transacción"
              type='datetime-local'
              maxLength={20}
              leftSection={<IconCalendar size={16} />}
              key={formTrans.key('fecha')}
              {...formTrans.getInputProps('fecha')}
            />
            <NumberInput
              label="Monto:"
              placeholder="0"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              maxLength={15}
              leftSection={<IconCashBanknote size={16} />}
              key={formTrans.key('monto')}
              {...formTrans.getInputProps('monto')}
            />
            <TextInput
              label="Concepto:"
              placeholder='Detalle de la transacción'
              type='text'
              required
              maxLength={100}
              leftSection={<IconBubble size={16} />}
              key={formTrans.key('concepto')}
              {...formTrans.getInputProps('concepto')}
            />
            <Group justify="flex-end" mt="md">
              {!idTrans && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Transacción</Button>}
              {idTrans && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Transacción</Button>}
            </Group>
          </form>
        </Modal>
        <Box style={{display:'flex',justifyContent:'space-between',margin:'1rem 0'}}>
          <Button onClick={nuevoTrans} style={{marginTop:'1.5rem'}} size='sm'>Nueva Transacción</Button>
          <div style={{display:'flex',gap:'1rem'}}>
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
          </div>
        </Box>
        <MantineReactTable table={tableTrans} />
      </Box>
    </div>
  )
}

export default Page