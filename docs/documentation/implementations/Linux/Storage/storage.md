---
pagination_next: null
pagination_prev: null
---

# Storage


import DocCardList from '@theme/DocCardList'; 
import { useCurrentSidebarCategory } from '@docusaurus/plugin-content-docs/client';

export const DocList = () => {
  const category = useCurrentSidebarCategory();
  return (
    <DocCardList items={category.items.filter(item => item.label !== 'Documentation')} />
  );
};

<DocList />
