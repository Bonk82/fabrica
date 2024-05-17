import { Button } from '@mantine/core'
import { IconAward } from '@tabler/icons-react';

const page = () => {
  const iAward = <IconAward/>
  return (
    <div>
      <h1>Clientes</h1>
      <Button fullWidth color='cyan' leftSection={iAward}>Ingresar</Button>
    </div>
  )
}

export default page