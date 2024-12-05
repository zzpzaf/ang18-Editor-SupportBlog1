
// Constants
const META_VALUES = {
  BLOG_SITE_NAME: 'A simple Multi-Container Blog Site Project',
  FAVICON_URL: '/assets/images/favicon.ico',
  ROBOTS_VALUE: 'index, follow',
  TWITTER_CARD_VALUE: 'summary_large_image',
} as const;


const SCHEMA_TYPES = {
  POST: 'BlogPosting',
  ORGANIZATION: 'Organization',
  ORG_NAME: 'The Big Byte Solutions',
  AUTHOR: 'Person',
  LOGO: 'ImageObject'
} as const;



export class PostTags {
  // Default values
  readonly postPgNr: number = 0;
  readonly blogsitename: string = META_VALUES.BLOG_SITE_NAME;
  readonly postfaviconUrl: string = META_VALUES.FAVICON_URL;
  readonly postRobotsValue: string = META_VALUES.ROBOTS_VALUE;
  readonly posttwiitercardValue: string = META_VALUES.TWITTER_CARD_VALUE;

  // Post metadata
  postTitle: string = '';
  postDescription: string = '';
  postFaviconUrl: string = '';
  postCanonicalUrl: string = '';
   postUser: string = '';
  postCreationTimestamp!: Date;

  // Open Graph metadata
  ogTitle: string = '';
  ogDescription: string = '';
  postTwiiterCardValue: string = '';

  constructor(init?: Partial<PostTags>) {
    Object.assign(this, init);
  }
}



// Interface for structured data
interface IStructuredDataConfig {
  headline: string;
  description: string;
  imageUrl: string;
  authorName: string;
  datePublished: string;
  orgLogoUrl: string;
}


export class PostStructuredData {
  private readonly orgName: string = SCHEMA_TYPES.ORG_NAME;

  constructor(private config?: Partial<IStructuredDataConfig>) {}

  public getStructuredDataWithDefaults(config: IStructuredDataConfig): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': SCHEMA_TYPES.POST,
      headline: config.headline,
      description: config.description,
      image: config.imageUrl,
      author: {
        '@type': SCHEMA_TYPES.AUTHOR,
        name: config.authorName,
      },
      datePublished: config.datePublished,
      publisher: {
        '@type': SCHEMA_TYPES.ORGANIZATION,
        name: this.orgName,
        logo: {
          '@type': SCHEMA_TYPES.LOGO,
          url: config.orgLogoUrl,
        },
      },
    };
  }
}




