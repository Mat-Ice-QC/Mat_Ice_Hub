---
pagination_next: null
pagination_prev: null
---

# Documentation Overview

For now, I have these types of documentations.

A French translation and more types of doc is coming soon.


---

import DocCardList from '@theme/DocCardList'; 
import { useCurrentSidebarCategory } from '@docusaurus/plugin-content-docs/client';

export const DocList = () => {
  const category = useCurrentSidebarCategory();
  return (
    <DocCardList
      items={category.items.filter(
        (item) => item.label !== 'Documentation Overview'
      )}
    />
  );
};

<DocList />

