import Head from 'next/head';
import Link from 'next/link';
import { IoCalendarClearOutline } from 'react-icons/io5';
import { FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  slug?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function loadMore(): Promise<void> {
    const data = await fetch(postsPagination.next_page).then(response =>
      response.json()
    );
    const results = data.results.map(post => {
      return {
        slug: post.uid,
        first_publication_date: new Date(
          post.first_publication_date
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...postsPagination.results, ...results]);
    setNextPage(data.next_day);
  }

  return (
    <>
      <Head>
        <title>Home | Space Travelling</title>
      </Head>
      {posts.map(post => (
        <main key={post.slug} className={styles.container}>
          <div className={styles.postPreview}>
            <Link href={`/post/${post.slug}`}>
              <a>
                <strong>{post.data.title}</strong>
                <h3>{post.data.subtitle}</h3>
                <div className={styles.postPreview__info}>
                  <time>
                    <IoCalendarClearOutline className={styles.calendar} />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <p>
                    <FiUser className={styles.user} />
                    {post.data.author}
                  </p>
                </div>
              </a>
            </Link>
            {nextPage && (
              <button
                className={styles.buttonLoader}
                onClick={loadMore}
                type="button"
              >
                Carregar mais posts
              </button>
            )}
          </div>
        </main>
      ))}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const { next_page } = postsResponse;
  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    next_page,
    results,
  };

  return {
    props: { postsPagination },
  };
};
