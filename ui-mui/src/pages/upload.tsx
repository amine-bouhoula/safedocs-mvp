import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UploadView } from 'src/sections/upload';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Sign in - ${CONFIG.appName}`}</title>
      </Helmet>

      <UploadView />
    </>
  );
}
