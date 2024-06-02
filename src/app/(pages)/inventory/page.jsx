'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconBuilding, IconCashBanknote, IconCheck, IconCode, IconDeviceFloppy, IconEdit, IconEye, IconGps, IconPhone, IconReceipt2, IconRefresh, IconSection, IconTrash, IconUser } from '@tabler/icons-react';
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
  const { loading,usuario,createReg,insumos,getReg,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)

  const hoy=dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('insumo','id_insumo',true);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      codigo:'',
      articulo:'',
      marca:'',
      modelo:'',
      descripcion:'',
      proveedor:'',
      telefono:'',
      fecha_compra:'',
      monto_compra:0,
      fecha_garantia:'',
      condicion:'',
      observacion:'',
      responsable:''
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

  const registrarInsumo = async (data) => {
    // event.preventDefault();
    console.log('la data',data);
    const newInsumo = {
      ...data,
      usuario_registro:usuario?.id,
      fecha_registro:new Date(),
      activo:1
    }
    console.log('new insumo',newInsumo,id);
    try {
      id ? await updateReg('insumo',newInsumo) : await createReg(newInsumo,'insumo');
      cargarData();
      toast('Control Insumo',`Insumo ${id? 'actualziado': 'registrado'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Insumo',error.message || error,'error')
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
        Está seguro de ELIMINAR el insumo: <strong>{e.articulo.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Insumo', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeleteCuenta(e),
    });
  }

  const onDeleteCuenta = async(e) => {
    console.log('delete insumo',e);
    try {
      await deleteReg('insumo',e.id_insumo);
      toast('Control Insumo',`Insumo eliminado satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Insumo',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    open()
    setId(data.id_insumo);
    form.setValues(data)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'codigo',
        header: 'Código',
      },
      {
        accessorKey: 'articulo',
        header: 'Artículo',
      },
      {
        accessorKey: 'marca',
        header: 'Marca',
      },
      {
        accessorKey: 'modelo',
        header: 'Modelo',
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
      },
      {
        accessorKey: 'proveedor',
        header: 'Proveedor',
      },
      {
        accessorKey: 'telefono',
        header: 'Teléfonos',
      },
      {
        accessorKey: 'fecha_compra',
        header: 'Fecha Compra',
      },
      {
        accessorKey: 'monto_compra',
        header: 'Valor de compra:',
      },
      {
        accessorKey: 'fecha_garantia',
        header: 'Fecha Vencimiento Garantía',
      },
      {
        accessorKey: 'condicion',
        header: 'Condición',
      },
      {
        accessorKey: 'observacion',
        header: 'Observación',
      },
      {
        accessorKey: 'responsable',
        header: 'Punto Responsable',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: insumos, 
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

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Inventario
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={id?'Actualizar Insumo: '+ id:'Registrar Insumo'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarInsumo(values))}>
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
              label="Artículo:"
              placeholder="Artículo"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('articulo')}
              {...form.getInputProps('articulo')}
            />
            <TextInput
              label="Marca:"
              placeholder="Marca del Insumo"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('marca')}
              {...form.getInputProps('marca')}
            />
            <TextInput
              label="Modelo:"
              placeholder="Modleo del Insumo"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('modelo')}
              {...form.getInputProps('modelo')}
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
            <TextInput
              label="Proveedor:"
              placeholder="Nombre del Proveedor"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('proveedor')}
              {...form.getInputProps('proveedor')}
            />
            <TextInput
              label="Teléfonos:"
              placeholder="Telefonos del contacto"
              type='text'
              maxLength={20}
              leftSection={<IconGps size={16} />}
              key={form.key('telefono')}
              {...form.getInputProps('telefono')}
            />
            <TextInput
              label="Fecha de Compra:"
              type='date'
              maxLength={15}
              max={hoy}
              leftSection={<IconGps size={16} />}
              key={form.key('fecha_compra')}
              {...form.getInputProps('fecha_compra')}
            />
            <NumberInput
              label="Valor de Compra:"
              placeholder="0.00"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              maxLength={15}
              leftSection={<IconReceipt2 size={16} />}
              key={form.key('monto_compra')}
              {...form.getInputProps('monto_compra')}
            />
            <TextInput
              label="Fecha Limite Garantía:"
              type='date'
              maxLength={15}
              leftSection={<IconGps size={16} />}
              key={form.key('fecha_garantia')}
              {...form.getInputProps('fecha_garantia')}
            />
            <NativeSelect
              label="Condición:"
              data={['NUEVO','USADO']}
              required
              leftSection={<IconSection size={16} />}
              key={form.key('condicion')}
              {...form.getInputProps('condicion')}
            />
            <TextInput
              label="Observacion:"
              placeholder="Observaciones del Insumo"
              type='text'
              maxLength={150}
              leftSection={<IconGps size={16} />}
              key={form.key('observacion')}
              {...form.getInputProps('observacion')}
            />
            <TextInput
              label="Responsable:"
              placeholder="Punto Responsable del Insumo"
              type='text'
              maxLength={20}
              // onInput={e=>e.target.value?.toUpperCase()}
              leftSection={<IconGps size={16} />}
              key={form.key('responsable').toUpperCase()}
              {...form.getInputProps('responsable')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Insumo</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Insumo</Button>}
            </Group>
          </form>
        </Modal>
        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nuevo Insumo</Button>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page