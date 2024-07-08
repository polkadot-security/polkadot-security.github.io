import React from 'react';
import { Grid, Image, Text, Paper } from '@mantine/core';

export default function Sections() {
  const Item = ({ href, children, imageSrc, description }) => (
    <a href={href}>
      <Paper shadow="md" radius="xl" p="xl">
        <Grid justify="flex-start" align="stretch">
          <Grid.Col span={4}>
          <Paper padding="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} h="150px">
            <Image
              src={imageSrc}
              className='section-icon'
              fit="contain"
              alt={description}
            />
            </Paper>
          </Grid.Col>
          <Grid.Col span={8}>
            <Paper style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} h="150px">
              <Text fw={500}><h1 className="mt-0 text-dark font-weight-bold text-center">{children}</h1></Text>
              <Text size="sm" c="dimmed">{description}</Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Paper>
    </a>
  );

  return (
    <Grid align="center">
      <Grid.Col span={6}>
        <Item
          href={"detect"}
          imageSrc="img/detect.png"
          description="Take a look at the latest vulnerabilities disclosures so you can detect them in your system."
        >
          Detect
        </Item>
      </Grid.Col>
      <Grid.Col span={6}>
        <Item
          href={"docs/protect/"}
          imageSrc="img/protect.png"
          description="Learn about common types of vulnerabilities that exist and how to protect against them."
        >
          Protect
        </Item>
      </Grid.Col>
    </Grid>
  );
}