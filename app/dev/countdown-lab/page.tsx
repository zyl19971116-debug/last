import {notFound} from 'next/navigation';
import {LocalCountdownLab} from '@/components/local-countdown-lab';

export default function CountdownLabPage(){
 if(process.env.NODE_ENV!=='development'||process.env.NEXT_PUBLIC_ENABLE_LOCAL_CHAIN!=='true')notFound();
 return <LocalCountdownLab/>;
}
