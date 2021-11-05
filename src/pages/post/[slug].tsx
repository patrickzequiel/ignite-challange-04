/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { GetStaticPaths, GetStaticProps } from 'next';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  slug: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
  const [words, _] = useState(
    post.data.content.reduce((acc, content) => {
      return (acc += content.body.reduce((_acc, text) => {
        return (_acc += text.text.split(' ').length);
      }, 0));
    }, 0)
  );

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Home | Space Travelling</title>
      </Head>
      <main key={post.uid} className={styles.container}>
        <img src={post.data.banner.url} alt="Banner" />
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.post__info}>
            <time>
              <IoCalendarClearOutline className={styles.calendar} />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>
              <FiUser className={styles.user} />
              {post.data.author}
            </p>
            <p>
              <FiClock className={styles.clock} />
              {Math.ceil(words / 200)} min
            </p>
          </div>

          <div className={styles.post__content}>
            {post.data.content.map(content => (
              <>
                <h2 key={post.uid}>{content.heading}</h2>
                <div
                  className={styles.post__content}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </>
            ))}
          </div>
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

  console.log(JSON.stringify(response, null, 2));
  const post: Post = {
    uid: response.data.title.toLowerCase().replace(/ /g, '-'),
    slug: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      content: response.data.content,
      banner: {
        url: response.data.banner.url,
      },
    },
  };

  return {
    props: {
      post,
    },
  };
};
