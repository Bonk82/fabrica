'use client'
import { useSupa } from '@/app/context/SupabaseContext';
import { ActionIcon, Box, Button, Center, Group, LoadingOverlay, Modal, NativeSelect, NumberInput, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form';
import { IconAlignLeft, IconBox, IconCheck, IconCircle1, IconCircleNumber1, IconDeviceFloppy, IconEdit, IconEye, IconFileBarcode, IconPlusMinus, IconReceipt2, IconRefresh, IconStack2, IconTrash } from '@tabler/icons-react';
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
  const { loading,usuario,createReg,productos,getReg,updateReg,deleteReg } = useSupa();
  const [opened, { open, close }] = useDisclosure(false);
  const [id, setId] = useState(null)
  // const iAward = <IconAward/>
  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const cargarData = async () =>{
    await getReg('producto','id_producto',false);
  }

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      codigo:'',
      categoria:'',
      descripcion:'',
      unidad:'',
      existencia:'',
      precio:'',
      promocion: '',
      pedido_minimo:''
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

  const registrarProducto = async (data) => {
    // event.preventDefault();
    data.codigo=data.codigo?.toUpperCase(),
    data.descripcion=data.descripcion?.toUpperCase(),
    console.log('la data',data);
    let newProduct
    if(id){
      newProduct = {
        ...data,
        usuario_modifica:usuario?.id,
        fecha_modifica:dayjs().add(-4,'hours'),
      }
    }
    if(!id){
      newProduct = {
        ...data,
        usuario_registro:usuario?.id,
        fecha_registro:dayjs().add(-4,'hours'),
        activo:1
      }
    }
    console.log('new producto',newProduct,id);
    try {
      id ? await updateReg('producto',newProduct) : await createReg(newProduct,'producto');
      cargarData();
      toast('Control Producto',`Producto ${id? 'actualziado': 'registrado'} satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Producto',error.message || error,'error')
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
        Está seguro de ELIMINAR el producto: <strong>{e.descripcion.toUpperCase()}</strong>
        </Text>
      ),
      labels: { confirm: 'Eliminar Producto', cancel: "Cancelar" },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => onDeleteProducto(e),
    });
  }

  const onDeleteProducto = async(e) => {
    console.log('delete producto',e);
    try {
      await deleteReg('producto',e.id_producto);
      toast('Control Producto',`Producto eliminado satisfactoriamente!`,'success')
    } catch (error) {
      toast('Control Producto',error.message || error,'error')
    } finally{
      cargarData()
    } 
  }

  const mostrarRegistro = (data) =>{
    console.log('cargando data',data);
    open()
    setId(data.id_producto);
    form.setValues(data)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'codigo',
        header: 'Código',
      },
      {
        accessorKey: 'categoria',
        header: 'Categoría',
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
      },
      {
        accessorKey: 'unidad',
        header: 'Unidad',
      },
      {
        accessorKey: 'existencia',
        header: 'Existencia',
      },
      {
        accessorKey: 'precio',
        header: 'Precio',
      },
      {
        accessorKey: 'promocion',
        header: 'Promoción',
      },
      {
        accessorKey: 'pedido_minimo',
        header: 'Pedido Mínimo',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: productos, 
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
          Productos
        </Text>
      </Center>
      <Box pos='relative'>
        <LoadingOverlay
          visible={loading}
          zIndex={39}
          overlayProps={{ radius: 'lg', blur: 4 }}
          loaderProps={{ color: 'cyan', type: 'dots',size:'xl' }}
        />
        <Modal opened={opened} onClose={close} title={id?'Actualizar Producto: '+ id:'Registrar Producto'}
          size='lg' zIndex={20} overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}>
          <form onSubmit={form.onSubmit((values) => registrarProducto(values))}>
            <TextInput
              label="Código:"
              placeholder="Código"
              key={form.key('codigo')}
              type='text'
              maxLength={10}
              leftSection={<IconFileBarcode size={16} />}
              {...form.getInputProps('codigo')}
            />
            <NativeSelect
              label="Categoría"
              data={['SELECCIONE...','SÓLIDOS', 'LÍQUIDOS','SERVICIOS','DERIVADOS']}
              leftSection={<IconBox size={16} />}
              key={form.key('categoria')}
              {...form.getInputProps('categoria')}
            />
            <TextInput
              label="Descripción:"
              placeholder="Descripción"
              key={form.key('descripcion')}
              type='text'
              maxLength={20}
              leftSection={<IconAlignLeft size={16} />}
              {...form.getInputProps('descripcion')}
            />
            <NativeSelect
              label="Tipo Unidad"
              data={['SELECCIONE...','KILO', 'BOLSA', 'PAQUETE','LITRO','BOTELLON','UNIDAD']}
              key={form.key('unidad')}
              leftSection={<IconBox size={16} />}
              {...form.getInputProps('unidad')}
            />
            <NumberInput
              label="Existencias:"
              placeholder="cantidad en stock"
              key={form.key('existencia')}
              defaultValue={0}
              allowDecimal={false}
              thousandSeparator=','
              min={0}
              maxLength={5}
              leftSection={<IconStack2 size={16} />}
              {...form.getInputProps('existencia')}
            />
            <NumberInput
              label="Precio:"
              placeholder="Precio normal de venta"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              maxLength={15}
              key={form.key('precio')}
              leftSection={<IconReceipt2 size={16} />}
              {...form.getInputProps('precio')}
            />
            <NumberInput
              label="Promoción:"
              placeholder="Promoción"
              prefix='Bs. '
              defaultValue={0.00}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator=','
              maxLength={15}
              key={form.key('promocion')}
              leftSection={<IconReceipt2 size={16} />}
              {...form.getInputProps('promocion')}
            />
            <NumberInput
              label="Pedido Mínimo:"
              placeholder="Pedido Mínimo"
              allowDecimal={false}
              key={form.key('pedido_minimo')}
              max={100}
              min={1}
              maxLength={3}
              leftSection={<IconCircleNumber1 size={16} />}
              {...form.getInputProps('pedido_minimo')}
            />
            <Group justify="flex-end" mt="md">
              {!id && <Button fullWidth leftSection={<IconDeviceFloppy/>} type='submit'>Registrar Producto</Button>}
              {id && <Button fullWidth leftSection={<IconRefresh/>} type='submit'>Actualizar Producto</Button>}
            </Group>
          </form>
        </Modal>
        <Button onClick={nuevo} style={{marginBottom:'1rem'}} size='sm'>Nuevo Producto</Button>
        <MantineReactTable table={table} />
      </Box>
    </div>
  )
}

export default Page