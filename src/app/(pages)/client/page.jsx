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

const Page = () => {
  const { loading,usuario,createReg,clientes,getReg,updateReg,deleteReg } = useSupa();
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
      direccion:'',
      coordenadas:'',
      referencia:'',
      telefonos:'',
      tipo_cliente: '',
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
    setId(data.id_cliente);
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
          Clientes
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: 'lg', blur: 2 }}
          loaderProps={{ color: 'indigo', type: 'bars' }}
        />
        <form onSubmit={form.onSubmit((values) => registrarCliente(values))}>
          <TextInput
            label="Nombre:"
            placeholder="Nombre"
            key={form.key('nombre')}
            type='text'
            {...form.getInputProps('nombre')}
          />
          <TextInput
            label="Direccion:"
            placeholder="Direccion"
            key={form.key('direccion')}
            type='text'
            {...form.getInputProps('direccion')}
          />
          <TextInput
            label="Coordenadas:"
            placeholder="Coordenadas"
            key={form.key('coordenadas')}
            type='text'
            {...form.getInputProps('coordenadas')}
          />
          <TextInput
            label="referencia:"
            placeholder="referencia"
            key={form.key('referencia')}
            type='text'
            {...form.getInputProps('referencia')}
          />
          <TextInput
            label="Telefonos:"
            placeholder="Telefonos"
            key={form.key('telefonos')}
            type='text'
            {...form.getInputProps('telefonos')}
          />
          <NativeSelect
            label="Tipo Cliente"
            data={['Eventual', 'Descuento', 'Pago Semanal']}
            key={form.key('tipo_cliente')}
            {...form.getInputProps('tipo_cliente')}
          />

          <Group justify="flex-end" mt="md">
            {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Cliente</Button>}
            {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Cliente</Button>}
          </Group>
        </form>

        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page