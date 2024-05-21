'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, NativeSelect, Notification, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconCheck, IconDeviceFloppy, IconEdit, IconEye, IconRefresh, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
import { notifications } from '@mantine/notifications';
import classes from '../../page.module.css';

const Page = () => {
  const { loading,usuario,createReg,clientes,getReg,updateReg } = useSupa();
  const [records, setRecords] = useState([])
  const [id, setId] = useState(null)
  // const iAward = <IconAward/>
  useEffect(() => {
    cargarCliente()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarCliente = async () =>{
    const r = await getReg('cliente','id_cliente',false);
    console.log('efect',clientes,records,r);
    setRecords(r); 
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

  const registrarCliente = async (data) => {
    // event.preventDefault();
    console.log('la data',data);

    // const data = new FormData(event.currentTarget);
    const newClient = {
      ...data,
      usuario_registro:usuario?.id,
      fecha_registro:new Date(),
      activo:1
    }

    console.log('new client',newClient,id);
    try {
      id ? await updateReg('cliente',newClient) : await createReg(newClient,'cliente');
      // setAlerta([true,'success','Préstamo registrado con éxito!'])
      // await cargarData();
      // console.log('los clientes',clientes);
      // setRecords(clientes)
      cargarCliente();
      // <Notification color="teal" title='Gestión Clientes' position="top-right">
      //   {`Cliente ${id? 'registrado': 'actualziado'} satisfactoriamente!`}
      // </Notification>
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: 'Gestión Clientes',
        message: `Cliente ${id? 'actualziado': 'registrado'} satisfactoriamente!`,
        color: 'lime',
        icon: <IconCheck/>,
        // className: 'my-notification-class',
        style: { backgroundColor: '#2A7045',color:'antiquewhite' },
        loading: false,
        classNames: classes,
      });
    } catch (error) {
      // setAlerta([true,'error',error.message || error])
      console.log(error);
    }finally{
      form.reset();
      setId(null)
    }
  }

  const cargarData = (data) =>{
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
        <ActionIcon variant="subtle" onClick={() => cargarData(row.original)}>
          <IconEdit color='orange' />
        </ActionIcon>
        <ActionIcon variant="subtle" onClick={() => console.info('Delete',row.original)}>
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

  // const mostrarNotificacion=(tipo,titulo,mensaje)=>{
  //   notifications.show({
  //     title: 'Default notification',
  //     message: 'Hey there, your code is awesome! 🤥',
  //   })
  // }

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Clientes
        </Text>
      </Center>
      <Button
        onClick={() =>
          notifications.show({
            title: 'Notification with custom styles',
            message: 'It is default blue',
            color:'grape.4',
            classNames: classes,
          })
        }
      >
        Default notification
      </Button>
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
      </Box>

      <MantineReactTable table={table} />

    </div>
  )
}

export default Page