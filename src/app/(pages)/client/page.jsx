'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, BackgroundImage, Box, Button, Center, Group, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconAward, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
// const columns = [
//   {
//     accessorKey: 'nombre',
//     header: 'Nombre',
//     enableColumnOrdering:true
//   },
//   {
//     accessorKey: 'direccion',
//     header: 'Dirección',
//   },
//   {
//     accessorKey: 'coordenadas',
//     header: 'Coordenadas',
//   },
//   {
//     accessorKey: 'referencia',
//     header: 'Referencia',
//   },
//   {
//     accessorKey: 'telefonos',
//     header: 'Teléfonos',
//   },
//   {
//     accessorKey: 'tipo_cliente',
//     header: 'Tipo Cliente',
//   },
// ];

const Page = () => {
  const { loading,usuario,createReg,clientes,getReg } = useSupa();
  const [records, setRecords] = useState([])
  const iAward = <IconAward/>
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

    validate: {
      tipo_cliente: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo Inválido'),
    },
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

    console.log('new client',newClient);
    try {
      await createReg(newClient,'cliente');
      // setAlerta([true,'success','Préstamo registrado con éxito!'])
      // await cargarData();
      console.log('los clientes',clientes);
      setRecords(clientes)
    } catch (error) {
      // setAlerta([true,'error',error.message || error])
      console.log(error);
    }
  }

  const cargarData = (data) =>{
    console.log(data);
  }

  // const table = useMantineReactTable({
  //   columns,
  //   data:records,
  //   initialState: {
  //     pagination: { pageSize: 5, pageIndex: 0 },
  //     showGlobalFilter: true,
  //   },
  //   //customize the MRT components
  //   mantinePaginationProps: {
  //     rowsPerPageOptions: ['5', '10', '15'],
  //   },
  //   paginationDisplayMode: 'pages',
  //   enableSorting:true,
  // });

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
    data: clientes, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    defaultColumn: {
      minSize: 20, //allow columns to get smaller than default
      maxSize: 200, //allow columns to get larger than default
      size: 100, //make columns wider by default
    },
    initialState: {
      density: 'xs',
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box>
        <ActionIcon variant="subtle" onClick={() => console.info('Edit',row.original)}>
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

  return (
    <div>
      <Center>
        <Text c="cyan.4" size='30px' fw={900}
          variant="gradient"
          gradient={{ from: 'lightblue', to: 'cyan', deg: 90 }}>
          Clientes
        </Text>
      </Center>
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
        <TextInput
          label="tipo_cliente:"
          placeholder="tipo_cliente"
          key={form.key('tipo_cliente')}
          type='text'
          {...form.getInputProps('tipo_cliente')}
        />

        <Group justify="flex-end" mt="md">
          <Button fullWidth leftSection={iAward} type='submit'>Ingresar</Button>
        </Group>
      </form>

      {/* <DataTable
        withTableBorder
        borderRadius="sm"
        striped
        columns={[
          { accessor: 'nombre',title:'Nombre' },
          { accessor: 'direccion',title:'Dirección' },
          { accessor: 'coordenadas',title:'Doordenadas' },
          { accessor: 'referencia',title:'Referencia' },
          { accessor: 'telefonos',title:'Teléfonos' },
          { accessor: 'tipo_cliente',title:'Tipo Cliente' },
          {
            accessor: 'actions',
            title: <Box mr={6}>Acciones</Box>,
            textAlign: 'right',
            render: (company) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="green"
                  onClick={() => cargarData({ company, action: 'view' })}
                >
                  <IconEye size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  onClick={() => cargarData({ company, action: 'edit' })}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => cargarData({ company, action: 'delete' })}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        records={records}
      /> */}

      <MantineReactTable table={table} />

    </div>
  )
}

export default Page