'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconBuilding, IconCashBanknote, IconCheck, IconDeviceFloppy, IconEdit, IconEye, IconGps, IconPhone, IconRefresh, IconTrash, IconUser } from '@tabler/icons-react';
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
  const { loading,usuario,createReg,proveedores,getReg,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('proveedor','id_proveedor',false);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      nombre:'',
      direccion:'',
      referencia:'',
      telefonos:'',
      cuenta:'',
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

  const registrarProveedor = async (data) => {
    // event.preventDefault();
    data.nombre=data.nombre?.toUpperCase(),
    data.direccion=data.direccion?.toUpperCase(),
    data.referencia=data.referencia?.toUpperCase(),
    console.log('la data',data);
    let newProveedor
    if(id){
      newProveedor = {
        ...data,
        usuario_modifica:usuario?.id,
        fecha_modifica:dayjs().add(-4,'hours'),
      }
    }
    if(!id){
      newProveedor = {
        ...data,
        usuario_registro:usuario?.id,
        fecha_registro:dayjs().add(-4,'hours'),
        activo:1
      }
    }
    console.log('new proveedor',newProveedor,id);
    try {
      id ? await updateReg('proveedor',newProveedor) : await createReg(newProveedor,'proveedor');
      cargarData();
      toast('Control Proveedor',`Proveedor ${id? 'actualziado': 'registrado'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Proveedor',error.message || error,'error')
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
        Está seguro de ELIMINAR el proveedor: <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Proveedor', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeleteProveedor(e),
    });
  }

  const onDeleteProveedor = async(e) => {
    console.log('delete proveedor',e);
    try {
      await deleteReg('proveedor',e.id_proveedor);
      toast('Control Proveedor',`Proveedor eliminado satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Proveedor',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    open()
    setId(data.id_proveedor);
    form.setValues(data)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
      },
      {
        accessorKey: 'direccion',
        header: 'Dirección',
      },
      {
        accessorKey: 'referencia',
        header: 'Referencia',
      },
      {
        accessorKey: 'telefonos',
        header: 'Teléfonos',
      },
      {
        accessorKey: 'cuenta',
        header: 'Cuenta Bancaria',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: proveedores, 
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
          Proveedores
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={id?'Actualizar Proveedor: '+ id:'Registrar Proveedor'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarProveedor(values))}>
            <TextInput
              label="Nombre:"
              placeholder="Nombre del proveedor o empresa"
              type='text'
              maxLength={100}
              leftSection={<IconUser size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            <TextInput
              label="Dirección:"
              placeholder="Dirección del local"
              type='text'
              maxLength={100}
              leftSection={<IconGps size={16} />}
              key={form.key('direccion')}
              {...form.getInputProps('direccion')}
            />
            <TextInput
              label="Referencia:"
              placeholder="Referencias para llegar al local"
              leftSection={<IconBuilding size={16} />}
              type='text'
              maxLength={100}
              key={form.key('referencia')}
              {...form.getInputProps('referencia')}
            />
            <NumberInput
              label="Teléfonos:"
              placeholder="70611111"
              allowDecimal={false}
              maxLength={30}
              leftSection={<IconPhone size={16} />}
              key={form.key('telefonos')}
              {...form.getInputProps('telefonos')}
            />
            <NumberInput
              label="Cuenta Bancaria:"
              placeholder="El numero de cuenta bancaria"
              allowDecimal={false}
              maxLength={15}
              leftSection={<IconCashBanknote size={16} />}
              key={form.key('cuenta')}
              {...form.getInputProps('cuenta')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Proveedor</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Proveedor</Button>}
            </Group>
          </form>
        </Modal>
        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nuevo Proveedor</Button>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page