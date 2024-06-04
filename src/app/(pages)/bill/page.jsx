'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import {  IconCalendar, IconCashBanknote, IconCode, IconDeviceFloppy, IconEdit, IconGps, IconRefresh, IconSection, IconTrash } from '@tabler/icons-react';
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
  const [idTrans, setIdtrans] = useState(null)
  const [f1, setF1] = useState(dayjs().startOf('month'))
  const [f2, setF2] = useState(dayjs().endOf('month'))

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('cuenta','id_cuenta',true);
    await getRegFilter('vw_transaccion','fecha_entrega',dayjs(f1).format('YYYY-MM-DD 04:00:00'),'between',dayjs(f2).format('YYYY-MM-DD 23:59:59'))
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
      categoria_cuenta:'',
      tipo_cuenta:'',
      nombre_cuenta:'',
      cliente:'',
      tipo_cliente:'',
      fecha:'',
      cantidad_entregada:0,
      producto:'',
      monto:0,
      descuento:0,
      fecha_entrega:'',
      metodo_pago:'',
      metodo_entrega:'',
      zona:''
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

  const confirmar = (e)=>{
    modals.openConfirmModal({
      title: 'Confirmar Eliminación',
      centered: true,
      children: (
        <Text size="sm">
        Está seguro de ELIMINAR la cuenta: <strong>{e.descripcion.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Cuenta', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeleteCuenta(e),
    });
  }

  const onDeleteCuenta = async(e) => {
    console.log('delete cuenta',e);
    try {
      await deleteReg('cuenta',e.id_cuenta);
      toast('Control Cuenta',`Cuenta eliminada satisfactoriamente!`,'success')
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

  const nuevo = ()=>{
    open()
    setId(null)
    form.reset()
  }
  const nuevoTrans = ()=>{
    setVerTrans(true)
    setIdtrans(null)
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
              // data={['OPERATIVO','VENTA DE PRODUCTOS','ALQUILER EQUIPOS','SALARIOS','SERVICIOS','INVERSIÓN','DESCUENTOS']}
              data={parametricas.filter(f=>f.tipo === 'CAT_CUENTA').map(e=>e.nombre)}
              required
              leftSection={<IconSection size={16} />}
              key={form.key('categoria')}
              {...form.getInputProps('categoria')}
            />
            <NativeSelect
              label="Tipo Cuenta:"
              data={['NEGOCIO','INGRESO','EGRESO','TRASPASO']}
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

        {/* <Modal opened={verTrans} onClose={setVerTrans(false)} title={idTrans?'Actualizar Transacción: '+ idTrans:'Registrar Transacción'}
          size='md' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <formTrans onSubmit={formTrans.onSubmit((values) => registrarCuenta(values))}>
            <NativeSelect
              label="Cuenta:"
              // data={['OPERATIVO','VENTA DE PRODUCTOS','ALQUILER EQUIPOS','SALARIOS','SERVICIOS','INVERSIÓN','DESCUENTOS']}
              data={cuentas.map(e=>e.descripcion)}
              required
              leftSection={<IconSection size={16} />}
              key={form.key('nombre_cuenta')}
              {...form.getInputProps('nombre_cuenta')}
            />
            <TextInput
              label="Fecha:"
              placeholder="Fecha de la transacción"
              type='datetime-local'
              maxLength={20}
              leftSection={<IconCalendar size={16} />}
              key={form.key('fecha')}
              {...form.getInputProps('fecha')}
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
              key={form.key('monto')}
              {...form.getInputProps('monto')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Transacción</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Transacción</Button>}
            </Group>
          </formTrans>
        </Modal> */}
        <Button onClick={nuevoTrans} style={{marginBottom:'1rem'}} size='sm'>Registrar Transacción</Button>
        <Box style={{display:'flex',justifyContent:'start',gap:'1rem'}}>
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
          <Button onClick={cargarTransaciones} size='sm' style={{marginTop:'1.5rem'}} >Cargar Transacciones</Button>
        </Box>
        <MantineReactTable table={tableTrans} />
      </Box>
    </div>
  )
}

export default Page