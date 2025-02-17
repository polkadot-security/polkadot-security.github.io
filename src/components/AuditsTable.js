import React, { useState, useEffect, useMemo } from "react";
import { Title, Stack } from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import Papa from 'papaparse';
import { format, parse } from 'date-fns';
import { MantineProvider } from './MantineProvider';

export default function AuditsTable() {
  const [audits, setAudits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/data/audits.csv?v=" + Date.now());
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          complete: (results) => {
            const [headers, ...rows] = results.data;
            const formattedData = rows.map(([firm, project, date, url]) => ({
              firm,
              project,
              date,
              url
            }));
            setAudits(formattedData);
            setIsLoading(false);
          },
          header: false,
          skipEmptyLines: true
        });
      } catch (error) {
        console.error(`Error fetching audit data: ${error}`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "Firm",
        accessorKey: "firm",
        id: "firm",
      },
      {
        header: "Project",
        accessorKey: "project",
        id: "project",
      },
      {
        header: "Date",
        accessorKey: "date",
        id: "date",
        sortingFn: 'datetime',
        Cell: ({ cell }) => {
          const date = parse(cell.getValue(), 'dd/MM/yyyy', new Date());
          return format(date, 'PPP'); // Format: Apr 29, 2023
        },
        sortingFn: (rowA, rowB, columnId) => {
          const dateA = parse(rowA.original[columnId], 'dd/MM/yyyy', new Date());
          const dateB = parse(rowB.original[columnId], 'dd/MM/yyyy', new Date());
          return dateA.getTime() - dateB.getTime();
        },
      },
      {
        header: "URL",
        accessorKey: "url",
        id: "url",
        Cell: ({ cell }) => (
          <a href={cell.getValue()} target="_blank" rel="noopener noreferrer">
            View Report
          </a>
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: audits,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableEditing: false, // Disable editing
    state: { isLoading },
    initialState: {
      sorting: [
        {
          id: 'date',
          desc: true
        }
      ],
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
    renderEmptyRowsFallback: () => (
      <Stack align="center" justify="center" style={{ height: "100%" }}>
        <Title order={5}>No audit reports available yet! Check again soon...</Title>
      </Stack>
    ),
  });

  return <MantineProvider><MantineReactTable table={table} /></MantineProvider>;
}
