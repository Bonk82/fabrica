import { Box } from '@mantine/core'
import { IconCashBanknote, IconDiabolo, IconGasStation, IconTir } from '@tabler/icons-react'
import '../cards.css'
import { useSupa } from '../context/SupabaseContext';

const Aside = () => {
  const { loading,transacciones } = useSupa();

  return (
    <Box style={{justifyContent:'space-between',gap:'1rem',display:'flex',flexDirection:'column'}} >
      <div className="card-box bg-primary">
        <div className="content">
          <div className='title'>Hielo bolsa 3Kg.</div>
          <h2>125</h2>
          {/* <h3>Bolsas de Hielo 3 Kg.</h3>
          <p>Programado</p> */}
        </div>
        <div className="icon">
          {/* <i class="fa fa-briefcase" aria-hidden="true"></i> */}
          <IconDiabolo size={50}/>
        </div>
      </div>
      <div className="card-box bg-success">
        <div className="content">
          <div className='title'>Monto Ventas</div>
          <h2>4.378,50</h2>
          {/* <h3>Bolsas de Hielo 3 Kg.</h3>
          <p>Programado</p> */}
        </div>
        <div className="icon">
          {/* <i class="fa fa-briefcase" aria-hidden="true"></i> */}
          <IconCashBanknote size={50}/>
        </div>
      </div>
      <div className="card-box bg-info">
        <div className="content">
          <div className='title'>Total Pedidos</div>
          <h2>189</h2>
          {/* <h3>Bolsas de Hielo 3 Kg.</h3>
          <p>Programado</p> */}
        </div>
        <div className="icon">
          {/* <i class="fa fa-briefcase" aria-hidden="true"></i> */}
          <IconTir size={50}/>
        </div>
      </div>
      <div className="card-box bg-danger">
        <div className="content">
          <div className='title'>Gastos Adminis.</div>
          <h2>678.75</h2>
          {/* <h3>Bolsas de Hielo 3 Kg.</h3>
          <p>Programado</p> */}
        </div>
        <div className="icon">
          {/* <i class="fa fa-briefcase" aria-hidden="true"></i> */}
          <IconGasStation size={50}/>
        </div>
      </div>
    </Box>
  )
}

export default Aside