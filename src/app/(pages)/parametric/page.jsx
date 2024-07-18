'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconBuilding, IconCashBanknote, IconCheck, IconCode, IconDeviceFloppy, IconEdit, IconEye, IconGps, IconKey, IconParentheses, IconPhone, IconRefresh, IconTex, IconTools, IconTrash, IconUser } from '@tabler/icons-react';
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
  const { loading,usuario,createReg,parametricas,getReg,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('parametrica','id_parametrica',true);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      tipo:'',
      nombre:'',
      codigo:'',
      agrupador:'',
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

  const registrarParametrica = async (data) => {
    // event.preventDefault();
    data.tipo=data.tipo?.toUpperCase(),
    data.nombre=data.nombre?.toUpperCase(),
    data.codigo=data.codigo?.toUpperCase(),
    data.agrupador=data.agrupador?.toUpperCase(),
    console.log('la data',data);
    const newParametrica = data
    console.log('new parametrica',newParametrica,id);
    try {
      id ? await updateReg('parametrica',newParametrica) : await createReg(newParametrica,'parametrica');
      cargarData();
      toast('Control Pramétrica',`Paramétrica ${id? 'actualziada': 'registrada'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Paramétrica',error.message || error,'error')
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
        Está seguro de ELIMINAR la paramétrica: <strong>{e.nombre.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Paramétrica', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeleteParametrica(e),
    });
  }

  const onDeleteParametrica = async(e) => {
    console.log('delete parametrica',e);
    try {
      await deleteReg('parametrica',e.id_parametrica);
      toast('Control Paramétrica',`Paramétrica eliminada satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Paramétrica',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    open()
    setId(data.id_parametrica);
    form.setValues(data)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'tipo',
        header: 'Tipo',
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
      },
      {
        accessorKey: 'codigo',
        header: 'Código',
      },
      {
        accessorKey: 'agrupador',
        header: 'Agrupador',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: parametricas, 
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
          Paramétricas
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={id?'Actualizar Paramétrica: '+ id:'Registrar Paramétrica'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarParametrica(values))}>
            <TextInput
              label="Tipo:"
              placeholder="Tipo de clasificador"
              type='text'
              maxLength={50}
              leftSection={<IconKey size={16} />}
              key={form.key('tipo')}
              {...form.getInputProps('tipo')}
            />
            <TextInput
              label="Nombre:"
              placeholder="Nombre del clasificador"
              type='text'
              maxLength={100}
              leftSection={<IconTex size={16} />}
              key={form.key('nombre')}
              {...form.getInputProps('nombre')}
            />
            <TextInput
              label="Código:"
              placeholder="Código o acronimo del clasificador"
              leftSection={<IconCode size={16} />}
              type='text'
              maxLength={10}
              key={form.key('codigo')}
              {...form.getInputProps('codigo')}
            />
            <TextInput
              label="Agrupador:"
              placeholder="Agrupador de clasificador dentro del mismo tipo"
              leftSection={<IconParentheses size={16} />}
              type='text'
              maxLength={10}
              key={form.key('aprupador')}
              {...form.getInputProps('agrupador')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Paramétrica</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Paramétrica</Button>}
            </Group>
          </form>
        </Modal>
        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nueva Paramétrica</Button>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page