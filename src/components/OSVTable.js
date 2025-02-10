import React, { useState, useEffect, useMemo } from "react";
import { Badge, Button, Title, Stack, Modal, Text, Group, List, Divider, Paper } from "@mantine/core";
import { IconFileCheck, IconFileDatabase, IconNotebook, IconCalendar, IconBug, IconVersions, IconLink, IconFileDescription } from '@tabler/icons-react';
import {
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import ReactMarkdown from 'react-markdown';
import { MantineProvider } from "./MantineProvider";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function OSVTable() {
  const {
    siteConfig: { customFields: { serverUrl } },
  } = useDocusaurusContext();
  const [osv, setOsv] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const resp = await fetch(`${serverUrl}/detect/vulnerabilities`, {
          credentials: 'include'
        });
        const body = await resp.json();
        if (
          !resp.ok ||
          body.vulns === null ||
          body.vulns === undefined ||
          typeof body.vulns !== "object"
        ) {
          throw new Error(body.message);
        }
        setOsv(osv.concat(body.vulns));
        setIsLoading(false);
      } catch (error) {
        console.error(`Error trying to fetch data: ${error}`);
      }
    };

    const fetchPublicData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/polkadot-vulnerabilities/osv/refs/heads/main/all.json');
        const data = await response.json();
        setOsv(data.vulns);
        if (authenticated) {
          fetchData();
        }
        setIsLoading(false);
      } catch (error) {
        console.error(`Error trying to fetch external data: ${error}`);
      }
    }

    fetchPublicData();
  }, [serverUrl]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${serverUrl}/login`);

      if (!response.ok) {
        setError(true);
        return
      }

      // Assuming the response includes a redirection URL on success
      const data = await response.json();
      console.log(data)
      setAuthenticated(true)

      // Redirecting to the provided URL on successful authentication
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No redirect URL provided');
      }
    } catch (err) {
      console.log(err)
      setError(true)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: "Title",
        accessorKey: "database_specific.title",
        id: "title",
        Cell({ cell }) {
          return <b><ReactMarkdown>{cell.getValue()}</ReactMarkdown></b>;
        },
        Edit: () => null,
      },
      {
        header: "ID",
        accessorKey: "id",
        id: "osv_id",
      },
      {
        header: "Severity",
        id: "severity",
        accessorFn: (dataRow) =>
          (dataRow.affected &&
            dataRow.affected[0]?.severity &&
            dataRow.affected[0]?.severity[0]?.score) ||
          "",
        Cell({ cell }) {
          return <Badge color={getSeverityColor(cell.getValue())}>{cell.getValue()}</Badge>;
        },
      },
      {
        header: "Affected System",
        accessorKey: "database_specific.affected_system",
        id: "affected_system",
      },
      {
        header: "Type",
        accessorKey: "database_specific.type",
        id: "osv_type",
      },
      {
        header: "Discovery Date",
        accessorKey: "database_specific.discovery_method",
        id: "discovery_method",
      },
      {
        header: "Discovery Date",
        accessorKey: "database_specific.discovery_date",
        id: "discovery_date",
      },
      {
        header: "Mitigation",
        accessorKey: "database_specific.mitigation",
        id: "mitigation",
      },
      {
        header: "Fixed",
        id: "affected",
        accessorFn: (dataRow) =>
          (dataRow.affected &&
            dataRow.affected[0]?.ranges &&
            dataRow.affected[0]?.ranges[0]?.events.find((event) => event.fixed)
              ?.fixed) ||
          false,
        Cell({ cell }) {
          return cell.getValue() ? (
            <Badge color="blue">Fix Available</Badge>
          ) : (
            <Badge color="red">Fix Not Available</Badge>
          );
        },
      },
      {
        header: "Affected Versions",
        id: "affected_versions",
        accessorFn: (dataRow) =>
          (dataRow.affected &&
            dataRow.affected[0]?.versions &&
            dataRow.affected[0]?.versions.join("\n")) ||
          "",
      },
      {
        header: "Summary",
        accessorKey: "summary",
        id: "summary",
      },
      {
        header: "Details",
        accessorKey: "details",
        id: "details",
      },
      {
        header: "Modified",
        accessorKey: "modified",
        id: "modified",
      },
      {
        header: "Published",
        accessorKey: "published",
        id: "published",
      },
      {
        header: "Actions",
        id: "actions",
        Cell({ row }) {
          return (
            <Button onClick={() => table.setEditingRow(row)}>Details</Button>
          );
        },
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: osv,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableEditing: true,
    state: { isLoading },
    renderEmptyRowsFallback: () => (
      <Stack align="center" justify="center" style={{ height: "100%" }}>
        <Title order={5}>No disclosures available yet! Check again soon...</Title>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Modal
        opened={table.getState().editingRow !== null}
        onClose={() => table.setEditingRow(null)}
        title={<Title order={3}>
          <ReactMarkdown>
            {row.original.database_specific.title}
          </ReactMarkdown>
          </Title>}
      >
        <Stack spacing="md">
          <Group position="start">
            <Badge size="lg" color="blue">{row.original.id}</Badge>
            <Badge size="lg" color={getSeverityColor(row.original.affected?.[0]?.severity?.[0]?.score)}>
              Severity: {row.original.affected?.[0]?.severity?.[0]?.score || 'N/A'}
            </Badge>
            <Badge size="lg" color={row.original.affected?.[0]?.ranges?.[0]?.events.find(event => event.fixed)?.fixed ? "green" : "red"}>
              {row.original.affected?.[0]?.ranges?.[0]?.events.find(event => event.fixed)?.fixed ? "Fix Available" : "No Fix Available"}
            </Badge>
          </Group>

          <Divider my="sm" />

          <Group spacing="xs">
            <IconBug size={20} />
            <Text weight={700}>Affected System:</Text>
            <Text>{row.original.database_specific.affected_system}</Text>
          </Group>

          <Group spacing="xs">
            <IconCalendar size={20} />
            <Text weight={700}>Discovery Date:</Text>
            <Text>{formatDate(row.original.database_specific.discovery_date) || 'N/A'}</Text>
          </Group>

          <Group spacing="xs" align="flex">
            <IconVersions size={20} style={{ marginTop: '5px' }} />
            <Text weight={700}>Affected Versions{row.original.affected?.[0]?.versions?.length < 5 && ':'}</Text>
            <Group spacing="xs">
              {row.original.affected?.[0]?.versions?.map((version, index) => (
                <Badge key={index} size="sm">{version}</Badge>
              )) || <Text>N/A</Text>}
            </Group>
          </Group>

          <Group spacing="xs">
            <IconFileDescription size={20} />
            <Text weight={700}>Summary</Text>
            <Paper>
              <ReactMarkdown>
                {row.original.summary}
              </ReactMarkdown>
            </Paper>
          </Group>

          <Group spacing="xs">
            <IconFileDatabase size={20} />
            <Text weight={700}>Details</Text>
            <Paper>
              <ReactMarkdown>
                {row.original.details}
              </ReactMarkdown>
            </Paper>
          </Group>

          <Group spacing="xs">
            <IconFileCheck size={20} />
            <Text weight={700}>Mitigation</Text>
            <a href={row.original.references.find(ref => ref.type == "FIX")?.url}>
              <Badge size="lg" color={row.original.affected?.[0]?.ranges?.[0]?.events.find(event => event.fixed)?.fixed ? "green" : "red"}>
                {row.original.affected?.[0]?.ranges?.[0]?.events.find(event => event.fixed)?.fixed ? "Fix Available Here" : "No Fix Available"}
              </Badge>
            </a>
            {
              row.original.affected?.[0]?.ranges?.[0]?.events.find(event => event.fixed)?.fixed &&
                'upgrade to'
            }
            {
              row.original.affected?.[0]?.ranges?.[0]?.events.find(event => event.fixed)?.fixed &&
                <Badge size="lg">{row.original.affected?.[0]?.ranges?.[0]?.events.find(event => event.fixed)?.fixed}</Badge>
            }
            <Paper>
              <ReactMarkdown>
                {
                  row.original.affected?.[0]?.database_specific?.mitigation ?
                    `${row.original.affected?.[0]?.database_specific?.mitigation}
                     ${row.original.affected?.[0]?.database_specific?.eta ? `\n\n**ETA**: ${row.original.affected?.[0]?.database_specific?.eta}` : ''}` :
                    'No mitigation details available at this time. Please check back later.'
                }
              </ReactMarkdown>
            </Paper>
          </Group>

          {row.original.references && (
            <Stack spacing="xs">
              <Group spacing="xs">
                <IconNotebook size={20} />
                <Text weight={700}>References</Text>
              </Group>
              <List
                spacing="xs"
                size="sm"
                center
                icon={<IconLink size={16} />}
              >
                {row.original.references.map((ref, index) => (
                  <List.Item key={index}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.url}</a>
                  </List.Item>
                ))}
              </List>
            </Stack>
          )}
        </Stack>
      </Modal>
    ),
    initialState: {
      columnVisibility: {
        severity: true,
        osv_id: false,
        osv_type: false,
        discovery_method: false,
        discovery_date: false,
        affected_versions: false,
        summary: false,
        details: false,
        modified: false,
        published: false,
        mitigation: false,
        "mrt-row-actions": false,
        "mrt-row-expand": false,
      },
    },
  });

  return (
    <>
      {<MantineProvider><MantineReactTable table={table}></MantineReactTable></MantineProvider>}
    </>
  );
}

// Helper function to determine severity color
function getSeverityColor(score) {
  if (!score) return 'gray';
  if (score == "Critical") return 'red';
  const numScore = parseFloat(score);
  if (numScore >= 9) return 'red';
  if (numScore >= 7) return 'orange';
  if (numScore >= 4) return 'yellow';
  return 'green';
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
