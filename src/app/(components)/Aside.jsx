import { Box } from '@mantine/core'
import { IconCashBanknote, IconDiabolo, IconGasStation, IconTir } from '@tabler/icons-react'
import '../cards.css'
import { useSupa } from '../context/SupabaseContext';
import { useEffect } from 'react';
import dayjs from 'dayjs';

const Aside = () => {
  const { loading,transacciones,productos,getReg,getRegFilter } = useSupa();

  useEffect(() => {
    cargarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargarData = async () =>{
    await getReg('producto','id_producto',true);
    await getRegFilter('vw_transaccion','fecha',dayjs(dayjs().startOf('month')).format('YYYY-MM-DD 04:00:00'),'between',dayjs(dayjs().endOf('month')).format('YYYY-MM-DD 23:59:59'))
  }
  

  return (
    <Box style={{justifyContent:'space-between',gap:'1rem',display:'flex',flexDirection:'column'}} >
      <div className="card-box bg-primary">
        <div className="content">
          <div className='title'>{productos[0]?.descripcion || 'Hielo bolsa 3Kg.'}</div>
          <h2>{(productos[0]?.existencia) || 0}</h2>
        </div>
        <div className="icon">
          <IconDiabolo size={50}/>
        </div>
      </div>
      <div className="card-box bg-success">
        <div className="content">
          <div className='title'>Monto Ventas</div>
          <h2>{(transacciones.filter(f=>f.fid_pedido).reduce((ac,el)=> ac + Number(el.monto),0))
              .toLocaleString('de-De', {maximumFractionDigits: 1 })}</h2>
        </div>
        <div className="icon">
          <IconCashBanknote size={50}/>
        </div>
      </div>
      <div className="card-box bg-info">
        <div className="content">
          <div className='title'>Total Pedidos</div>
          <h2>{(transacciones.filter(f=>f.fid_pedido).length)
              .toLocaleString('de-De')}</h2>
        </div>
        <div className="icon">
          <IconTir size={50}/>
        </div>
      </div>
      <div className="card-box bg-danger">
        <div className="content">
          <div className='title'>Gastos Adminis.</div>
          <h2>{(transacciones.filter(f=>f.tipo_cuenta?.toUpperCase() == 'EGRESO' ).reduce((ac,el)=>ac+Number(el.monto),0))
              .toLocaleString('de-De', {maximumFractionDigits: 1 })}</h2>
        </div>
        <div className="icon">
          <IconGasStation size={50}/>
        </div>
      </div>
    </Box>
  )
}

export default Aside