'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconBuilding, IconCheck, IconDeviceFloppy, IconEdit, IconEye, IconFolder, IconGps, IconMail, IconMap, IconMapSearch, IconPhone, IconRefresh, IconTrash, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';

const Page = () => {
  const { loading,usuario,createReg,clientes,getReg,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)
  
  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('cliente','id_cliente',false);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      nombre:'',
      telefonos:'',
      referencia:'',
      categoria:'',
      tipo_cliente:'',
      estado: '',
      propietario:'',
      propietario_celular:'',
      administrador:'',
      administrador_celular:'',
      correo:'',
      ciudad: '',
      zona:'',
      direccion:'',
      coordenadas:'',
      equipo:'',
      letrero:'',
    },
    validate: {
      correo: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
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

  const registrarCliente = async (data) => {
    // event.preventDefault();
    console.log('la data',data);
    const newClient = {
      ...data,
      usuario_registro:usuario?.id,
      fecha_registro:new Date(),
      activo:1
    }
    console.log('new client',newClient,id);
    try {
      id ? await updateReg('cliente',newClient) : await createReg(newClient,'cliente');
      cargarData();
      toast('Control Clientes',`Cliente ${id? 'actualziado': 'registrado'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Clientes',error.message || error,'error')
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
        Está seguro de ELIMINAR el cliente: <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Cliente', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeleteCliente(e),
    });
  }

  const onDeleteCliente = async(e) => {
    console.log('delete cliente',e);
    try {
      await deleteReg('cliente',e.id_cliente);
      toast('Control Clientes',`Cliente eliminado satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Clientes',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    open()
    setId(data.id_cliente)
    form.setValues(data)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
      },
      {
        accessorKey: 'categoria',
        header: 'Categoría',
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
      },
      {
        accessorKey: 'propietario',
        header: 'Propietario',
      },
      {
        accessorKey: 'propietario_celular',
        header: 'Propietario Cel.',
      },
      {
        accessorKey: 'administrador',
        header: 'Administrador',
      },
      {
        accessorKey: 'administrador_celular',
        header: 'Administrador Cel.',
      },
      {
        accessorKey: 'correo',
        header: 'Correo',
      },
      {
        accessorKey: 'ciudad',
        header: 'Ciudad',
      },
      {
        accessorKey: 'zona',
        header: 'Zona',
      },
      {
        accessorKey: 'direccion',
        header: 'Dirección',
      },
      {
        accessorKey: 'coordenadas',
        header: 'Coordenadas',
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
        accessorKey: 'tipo_cliente',
        header: 'Tipo Cliente',
      },
      {
        accessorKey: 'equipo',
        header: 'Equipo Frio',
      },
      {
        accessorKey: 'letrero',
        header: 'letrero',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: clientes, 
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
          Clientes
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={id?'Actualizar Cliente: '+ id:'Registrar Cliente'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarCliente(values))}>
            <TextInput
              label="Nombre:"
              placeholder="Nombre"
              type='text'
              maxLength={100}
              leftSection={<IconUser size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            <NativeSelect
              label="Categoría"
              data={['BAR', 'CAFETERÍA', 'COMPLEJO DEPORTIVO', 'SALÓN DE EVENTOS', 'DISCOTECA','PUB','KARAOKE']}
              leftSection={<IconFolder size={16} />}
              key={form.key('categoria')}
              {...form.getInputProps('categoria')}
            />
            <NativeSelect
              label="Estado"
              data={['COMPRA','NO COMPRA']}
              leftSection={<IconFolder size={16} />}
              key={form.key('estado')}
              {...form.getInputProps('estado')}
            />
            <TextInput
              label="Propietario:"
              placeholder="Propietario"
              type='text'
              maxLength={50}
              leftSection={<IconUser size={16} />}
              key={form.key('propietario')}
              {...form.getInputProps('propietario')}
            />
            <TextInput
              label="Propietario Celular:"
              placeholder="Propietario Celular"
              type='text'
              maxLength={20}
              leftSection={<IconPhone size={16} />}
              key={form.key('propietario_celular')}
              {...form.getInputProps('propietario_celular')}
            />
            <TextInput
              label="Administrador:"
              placeholder="Administrador"
              type='text'
              maxLength={50}
              leftSection={<IconUser size={16} />}
              key={form.key('administrador')}
              {...form.getInputProps('administrador')}
            />
            <TextInput
              label="Administrador Celular:"
              placeholder="Administrador Celular"
              type='text'
              maxLength={20}
              leftSection={<IconPhone size={16} />}
              key={form.key('administrador_celular')}
              {...form.getInputProps('administrador_celular')}
            />
            <TextInput
              label="Correo:"
              placeholder="sucorreo@gmail.com"
              type='text'
              maxLength={50}
              leftSection={<IconMail size={16} />}
              key={form.key('correo')}
              {...form.getInputProps('correo')}
            />
            <TextInput
              label="Ciudad:"
              placeholder="Ciudad"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('ciudad')}
              {...form.getInputProps('ciudad')}
            />
            <TextInput
              label="Zona:"
              placeholder="zona"
              type='text'
              maxLength={50}
              leftSection={<IconGps size={16} />}
              key={form.key('zona')}
              {...form.getInputProps('zona')}
            />
            <TextInput
              label="Direccion:"
              placeholder="Direccion"
              type='text'
              maxLength={100}
              leftSection={<IconGps size={16} />}
              key={form.key('direccion')}
              {...form.getInputProps('direccion')}
            />
            <TextInput
              label="Coordenadas:"
              placeholder="Coordenadas"
              type='text'
              maxLength={50}
              leftSection={<IconMapSearch size={16} />}
              key={form.key('coordenadas')}
              {...form.getInputProps('coordenadas')}
            />
            <TextInput
              label="referencia:"
              placeholder="referencia"
              type='text'
              maxLength={100}
              leftSection={<IconBuilding size={16} />}
              key={form.key('referencia')}
              {...form.getInputProps('referencia')}
            />
            <TextInput
              label="Telefonos:"
              placeholder="Telefonos"
              type='text'
              maxLength={50}
              leftSection={<IconPhone size={16} />}
              key={form.key('telefonos')}
              {...form.getInputProps('telefonos')}
            />
            <NativeSelect
              label="Equipo:"
              data={['Propio', 'Préstamo']}
              leftSection={<IconFolder size={16} />}
              key={form.key('equipo')}
              {...form.getInputProps('equipo')}
            />
            <NativeSelect
              label="Letrero:"
              data={['SI', 'NO']}
              leftSection={<IconFolder size={16} />}
              key={form.key('letrero')}
              {...form.getInputProps('letrero')}
            />
            <NativeSelect
              label="Tipo Cliente"
              data={['Eventual', 'Descuento', 'Pago Semanal']}
              leftSection={<IconFolder size={16} />}
              key={form.key('tipo_cliente')}
              {...form.getInputProps('tipo_cliente')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Cliente</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Cliente</Button>}
            </Group>
          </form>
        </Modal>
        
        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nuevo Pedido</Button>

        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page