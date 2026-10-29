<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet
  version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>RSS Feed | <xsl:value-of select="rss/channel/title" /></title>
        <link rel="stylesheet" href="custom-rss.css" />
      </head>
      <body>
        <main>
          <div class="description">
            <div class="info">
              <strong>This is an RSS feed</strong>. Subscribe by copying the URL from the address
              bar into your newsreader. Visit <a
                href="https://aboutfeeds.com/">About Feeds</a> to learn more
              and get started. It’s free. </div>
            <h1 class="flex items-start">
              <div class="rss-icon">
                <svg
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 455.731 455.731"
                  xml:space="preserve">
                  <g>
                    <rect
                      x="0"
                      y="0"
                      style="fill:#F78422;"
                      width="455.731"
                      height="455.731"
                    />
                    <g>
                      <path
                        style="fill:#FFFFFF;"
                        d="M296.208,159.16C234.445,97.397,152.266,63.382,64.81,63.382v64.348
                        c70.268,0,136.288,27.321,185.898,76.931c49.609,49.61,76.931,115.63,76.931,185.898h64.348
                        C391.986,303.103,357.971,220.923,296.208,159.16z"
                      />
                      <path
                        style="fill:#FFFFFF;"
                        d="M64.143,172.273v64.348c84.881,0,153.938,69.056,153.938,153.939h64.348
                        C282.429,270.196,184.507,172.273,64.143,172.273z"
                      />
                      <circle
                        style="fill:#FFFFFF;"
                        cx="109.833"
                        cy="346.26"
                        r="46.088"
                      />
                    </g>
                  </g>
                </svg>
              </div>
  Custom RSS Feed Preview </h1>
            <h2>
              <xsl:value-of select="rss/channel/title" />
            </h2>
            <p>Description: <xsl:value-of
                select="rss/channel/description"
              /></p>
          </div>
          <h2>Recent Posts</h2>
          <div class="postsList">
            <xsl:for-each select="rss/channel/item">
              <div class="pb-7">
                <a href="{link}">
                  <xsl:value-of select="title" />
                </a>
                <div class="text-2 text-offset"> Published on <xsl:value-of
                    select="substring(pubDate,0,17)"
                  />
                </div>
                <div class="text-2 text-offset italic">
                  <xsl:value-of select="description" />
                </div>
              </div>
            </xsl:for-each>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
