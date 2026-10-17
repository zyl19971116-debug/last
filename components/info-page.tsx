import {SiteShell} from './site-shell';
export function InfoPage({kicker,title,intro,children}:{kicker:string,title:string,intro:string,children:React.ReactNode}){return <SiteShell><main className="page"><header className="page-head"><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{intro}</p></header>{children}</main></SiteShell>}
