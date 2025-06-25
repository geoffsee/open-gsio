import { SimpleGrid } from '@chakra-ui/react';
import { Rocket, Shield } from 'lucide-react';
import React from 'react';

import DemoCard from './DemoCard';

function DemoComponent() {
  return (
    <SimpleGrid columns={{ base: 1, sm: 1, lg: 2 }} spacing={'7%'} minH={'min-content'} h={'100vh'}>
      <DemoCard
        icon={<Rocket size={24} color="teal" />}
        title="toak"
        description="A tool for turning git repositories into markdown, without their secrets"
        imageUrl="/code-tokenizer-md.jpg"
        badge="npm"
        onClick={() => {
          window.open('https://github.com/seemueller-io/toak');
        }}
      />
      <DemoCard
        icon={<Shield size={24} color="teal" />}
        title="REHOBOAM"
        description="Explore the latest in AI news around the world in real-time"
        imageUrl="/rehoboam.png"
        badge="APP"
        onClick={() => {
          window.open('https://rehoboam.seemueller.io');
        }}
      />
    </SimpleGrid>
  );
}

export default DemoComponent;
