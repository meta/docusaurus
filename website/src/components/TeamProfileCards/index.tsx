/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ReactNode} from 'react';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

function WebsiteLink({to, children}: {to: string; children?: ReactNode}) {
  return (
    <Link to={to}>
      {children ?? (
        <Translate id="team.profile.websiteLinkLabel">website</Translate>
      )}
    </Link>
  );
}

type ProfileProps = {
  className?: string;
  name: string;
  children: ReactNode;
  githubUrl: string;
  xUrl?: string;
};

function TeamProfileCard({
  className,
  name,
  children,
  githubUrl,
  xUrl,
}: ProfileProps) {
  return (
    <div className={className}>
      <div className="card card--full-height">
        <div className="card__header">
          <div className="avatar avatar--vertical">
            <img
              className="avatar__photo avatar__photo--xl"
              src={`${githubUrl}.png`}
              alt={`${name}'s avatar`}
            />
            <div className="avatar__intro">
              <Heading as="h3" className="avatar__name">
                {name}
              </Heading>
            </div>
          </div>
        </div>
        <div className="card__body">{children}</div>
        <div className="card__footer">
          <div className="button-group button-group--block">
            {githubUrl && (
              <Link className="button button--secondary" href={githubUrl}>
                GitHub
              </Link>
            )}
            {xUrl && (
              <Link className="button button--secondary" href={xUrl}>
                X
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamProfileCardCol(props: ProfileProps) {
  return (
    <TeamProfileCard {...props} className="col col--6 margin-bottom--lg" />
  );
}

export function ActiveTeamRow(): ReactNode {
  return (
    <div className="row">
      <TeamProfileCardCol
        name="Sébastien Lorber"
        githubUrl="https://github.com/slorber"
        xUrl="https://x.com/sebastienlorber">
        <Translate
          id="team.profile.Sebastien Lorber.body"
          values={{
            website: <WebsiteLink to="https://sebastienlorber.com/" />,
            devto: <Link to="https://dev.to/sebastienlorber">Dev.to</Link>,
          }}>
          {
            'React lover since 2014. Freelance, helping Facebook ship Docusaurus v2. He writes regularly, on his {website} and {devto}.'
          }
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Sida Chen"
        githubUrl="https://github.com/Josh-Cena"
        xUrl="https://x.com/SidaChen63">
        <Translate id="team.profile.Sida Chen.body">
          Student from Shanghai, China. Enthusiastic open-source project
          creator, but never actually works hard on those projects he created.
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Clément Couriol"
        githubUrl="https://github.com/ozakione">
        <Translate id="team.profile.Clement Couriol.body">
          Student from CPE Lyon, France. Passionate web developer who tries to
          become an expert web developer.
        </Translate>
      </TeamProfileCardCol>
    </div>
  );
}

export function HonoraryAlumniTeamRow(): ReactNode {
  return (
    <div className="row">
      <TeamProfileCardCol
        name="Joel Marcey"
        githubUrl="https://github.com/JoelMarcey"
        xUrl="https://x.com/joelmarcey">
        <Translate id="team.profile.Joel Marcey.body">
          Docusaurus founder and now ever grateful Docusaurus cheerleader to
          those who actually write code for it.
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Alexey Pyltsyn"
        githubUrl="https://github.com/lex111">
        <Translate id="team.profile.Alexey Pyltsyn.body">
          Obsessed open-source enthusiast 👋 Eternal amateur at everything 🤷‍♂️
          Maintainer of Russian docs on PHP, React, Kubernetes and much more 🧐
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Yangshun Tay"
        githubUrl="https://github.com/yangshun"
        xUrl="https://x.com/yangshunz">
        <Translate id="team.profile.Yangshun Tay.body">
          Full Front End Stack developer who likes working on the Jamstack.
          Working on Docusaurus made him Facebook&apos;s unofficial part-time
          Open Source webmaster, which is an awesome role to be in.
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Endilie Yacop Sucipto"
        githubUrl="https://github.com/endiliey"
        xUrl="https://x.com/endiliey">
        <Translate id="team.profile.Endilie Yacop Sucipto.body">
          Maintainer @docusaurus · 🔥🔥🔥
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Wei Gao"
        githubUrl="https://github.com/wgao19"
        xUrl="https://x.com/wgao19">
        <Translate id="team.profile.Wei Gao.body">
          🏻‍🌾 Work in progress React developer, maintains Docusaurus, writes docs
          and spams this world with many websites.
        </Translate>
      </TeamProfileCardCol>
    </div>
  );
}

export function StudentFellowsTeamRow(): ReactNode {
  return (
    <div className="row">
      <TeamProfileCardCol
        name="Anshul Goyal"
        githubUrl="https://github.com/anshulrgoyal"
        xUrl="https://x.com/ar_goyal">
        <Translate
          id="team.profile.Anshul Goyal.body"
          values={{
            websiteLink: (
              <Link href="https://anshulgoyal.dev/">
                <Translate id="team.profile.Anshul Goyal.body.websiteLink.label">
                  website
                </Translate>
              </Link>
            ),
          }}>
          {
            'Fullstack developer who loves to code and try new technologies. In his free time, he contributes to open source, writes blog posts on his {websiteLink} and watches Anime.'
          }
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Drew Alexander"
        githubUrl="https://github.com/drewbi">
        <Translate id="team.profile.Drew Alexander.body">
          Developer and Creative, trying to gain the skills to build whatever he
          can think of.
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Fanny Vieira"
        githubUrl="https://github.com/fanny"
        xUrl="https://x.com/fannyvieiira">
        <Translate
          id="team.profile.Fanny Vieira.body"
          values={{
            blogLink: (
              <Link href="https://dev.to/fannyvieira">
                <Translate id="team.profile.Fanny Vieira.body.blogLink.label">
                  her blog
                </Translate>
              </Link>
            ),
            spotifyLink: (
              <Link href="https://open.spotify.com/user/anotherfanny">
                <Translate id="team.profile.Fanny Vieira.body.spotifyLink.label">
                  Spotify playlists
                </Translate>
              </Link>
            ),
          }}>
          {
            'Fanny got started with web development in high school, building a project for the school kitchen. In her free time she loves contributing to Open Source, occasionally writing on {blogLink} about her experiences, cooking, and creating {spotifyLink}.'
          }
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Sam Zhou"
        githubUrl="https://github.com/SamChou19815"
        xUrl="https://x.com/SamChou19815">
        <Translate
          id="team.profile.Sam Zhou.body"
          values={{
            websiteLink: (
              <Link href="https://developersam.com">
                <Translate id="team.profile.Anshul Goyal.body.websiteLink.label">
                  website
                </Translate>
              </Link>
            ),
            samLangLink: (
              <Link href="https://samlang.developersam.com/">
                <Translate id="team.profile.Sam Zhou.body.samLangLink.label">
                  programming language
                </Translate>
              </Link>
            ),
            miniReactLink: (
              <Link href="https://github.com/SamChou19815/mini-react">
                <Translate id="team.profile.Sam Zhou.body.miniReactLink.label">
                  mini React
                </Translate>
              </Link>
            ),
          }}>
          {
            'Sam started programming in 2011 and built his {websiteLink} in 2015. He is interested in programming languages, dev infra and web development, and has built his own {samLangLink} and {miniReactLink}.'
          }
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Tan Teik Jun"
        githubUrl="https://github.com/teikjun"
        xUrl="https://x.com/teik_jun">
        <Translate id="team.profile.Tan Teik Jun.body">
          Open-source enthusiast who aims to become as awesome as the other
          humans on this page. Working on Docusaurus brought him closer to his
          goal. 🌱
        </Translate>
      </TeamProfileCardCol>
      <TeamProfileCardCol
        name="Nisarag Bhatt"
        githubUrl="https://github.com/FocalChord"
        xUrl="https://x.com/focalchord_">
        <Translate id="team.profile.Nisarag Bhatt.body">
          Fullstack web developer who loves learning new technologies and
          applying them! Loves contributing to open source as well as writing
          content articles and tutorials.
        </Translate>
      </TeamProfileCardCol>
    </div>
  );
}
