import { notifications } from '@mantine/notifications';
import classes from '../../app/toast.module.css';

export const Toast = ({title,message,type}) => {
  // const {title,message,type} = props
  console.log('la data',title,message,type);
  let color = 'lime.7'
  if(type == 'success') color = 'lime.7';
  if(type == 'info') color = 'cyan.7';
  if(type == 'warning') color = 'yellow.7';
  if(type == 'error') color = 'red.7';

  return (
    <div>
      {notifications.show({
      title,
      message,
      color,
      classNames: classes,
      })}
    </div>
  )
}