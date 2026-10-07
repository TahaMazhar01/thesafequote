import Link from "next/link";
import { Icon } from "@/components/icon";
export default function NotFound() { return <section className="section not-found"><div className="container"><span className="error-code">404</span><h1>Let’s get you<br /><em>back on the right path.</em></h1><p>We couldn’t find that page. A little peace of mind is still just a click away.</p><Link className="button" href="/">Back to home <Icon name="arrow" size={19} /></Link></div></section>; }
