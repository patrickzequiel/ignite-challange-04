import Head from 'next/head';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  slug: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Home | Space Travelling</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <time>{post.first_publication_date}</time>
          <div
            className={styles.post__content}
            dangerouslySetInnerHTML={{ __html: post.data.content }}
          />
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [],
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  console.log(response);
//   const post: Post = {
//     first_publication_date: response.first_publication_date,
//     data: {
//         title: response.data.title,
//         author: response.data.author,
//         content: {
//           banner: {
//             url: response.data.banner.url,
//           },
//           heading: response.data.content.heading,
//             body: {
//              text: response.data.content.body.text,
//             }

//     }
// }
};
