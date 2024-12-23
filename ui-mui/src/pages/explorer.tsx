import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { FileExplorerView } from 'src/sections/explorer';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Users - ${CONFIG.appName}`}</title>
      </Helmet>

      <FileExplorerView />
    </>
  );
}
