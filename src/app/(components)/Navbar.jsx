import { useRouter } from 'next/navigation';
import { useSupa } from '../context/SupabaseContext';
import { Button } from '@mantine/core';
import { IconUsersGroup,IconBuildingFactory2,IconBriefcase,IconUserCog,IconUserCheck,IconTimeline } from '@tabler/icons-react';


const Navbar = () => {
  const { menu} = useSupa();
  const menues = menu;
  console.log('en navbar',menu);
  const router = useRouter()

  const navegar = (url) =>{
    if(url) router.push(url);
  }

  const icons = [
  <IconUsersGroup key={0}/>,
  <IconBuildingFactory2 key={1}/>,
  <IconBriefcase key={2} />,
  <IconUserCog key={3} />,
  <IconUserCheck key={4} />,
  <IconTimeline key={5} />]

  return (
    <div style={{textAlign:'left'}}>
      {menues.map((e,i)=>(
        <Button key={e.id_menu}
          leftSection={icons[i]}
          onClick={()=>navegar(e.ruta)}
          fullWidth style={{marginBottom:'1rem'}}
          justify='flex-start'
          variant='light'
        >
          {e.descripcion}
        </Button>
      ))}
    </div>
  )
}

export default Navbar