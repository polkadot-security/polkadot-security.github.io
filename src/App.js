import React from 'react';
import { MantineProvider } from './components/MantineProvider';
import AuditsTable from './components/AuditsTable';

function App() {
  return (
    <MantineProvider>
      <AuditsTable />
      {/* Other components */}
    </MantineProvider>
  );
}

export default App;