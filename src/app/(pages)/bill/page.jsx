'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconBuilding, IconCashBanknote, IconCheck, IconCode, IconDeviceFloppy, IconEdit, IconEye, IconGps, IconPhone, IconRefresh, IconSection, IconTrash, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable} from 'mantine-react-table';
import { MRT_Localization_ES } from 'mantine-react-table/locales/es';
import { notifications } from '@mantine/notifications';
import classes from '../../toast.module.css';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';

const Page = () => {
  const { loading,usuario,createReg,cuentas,getReg,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('cuenta','id_cuenta',true);
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

  const registrarCuenta = async (data) => {
    // event.preventDefault();
    console.log('la data',data);
    const newCuenta = {
      ...data,
      usuario_registro:usuario?.id,
      fecha_registro:new Date(),
      activo:1
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
        <Modal opened={opened} onClose={close} title={id?'Actualizar Cuenta: '+ id:'Registrar Cuenta'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarCuenta(values))}>
            <TextInput
              label="Código:"
              placeholder="325001"
              type='text'
              leftSection={<IconCode size={16} />}
              key={form.key('codigo')}
              {...form.getInputProps('codigo')}
            />
            <TextInput
              label="Descripción:"
              placeholder="Nombre de la cuenta"
              type='text'
              leftSection={<IconGps size={16} />}
              key={form.key('descripcion')}
              {...form.getInputProps('descripcion')}
            />
            <NativeSelect
              label="Categoría:"
              data={['Operativos','Ventas Productos','Alquiler Equipos','Salarios','Servicios','Inversión','Descuentos']}
              required
              leftSection={<IconSection size={16} />}
              key={form.key('categoria')}
              {...form.getInputProps('categoria')}
            />
            <NativeSelect
              label="Tipo Cuenta:"
              data={['Negocio','Ingreso','Egreso','Traspaso']}
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
        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nuevo Cuenta</Button>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page