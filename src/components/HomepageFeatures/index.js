import { useEffect } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import Konami from 'konami';

const FeatureList = [
  {
    title: 'What I Studied',
    Svg: require('@site/static/img/network.svg').default,
    description: (
      <>
        I studied networking 
        ... I dropped out but all my networking classes are done :)
      </>
    ),
  },
  {
    title: 'Jack of all trades, master of some',
    Svg: require('@site/static/img/mat_ice.svg').default,
    description: (
      <>
        Name it, You can count me in anything: passing eth cables, building racks, scripting, researching hardware, building servers...
      </>
    ),
  },
  {
    title: "Where I'm from",
    Svg: require('@site/static/img/mtl.svg').default,
    description: (
      <>
        The city of many orange cones and countless traffic jams.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

// Main exported component
export default function HomepageFeatures() {
  useEffect(() => {
    // Konami code only runs on the client
    const easterEgg = new Konami(() => {
      window.location.href = 'quebec/index.html';
    });
    return () => easterEgg.unload();
  }, []);

  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
