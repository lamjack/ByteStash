import React from "react";
import { Link, useLocation } from "react-router-dom";

interface SnippetCardLinkProps {
  snippetId: string;
  title: string;
}

const SnippetCardLink: React.FC<SnippetCardLinkProps> = ({ snippetId, title }) => {
  const location = useLocation();

  return (
    <Link
      to={`/snippets/${snippetId}`}
      state={{ from: `${location.pathname}${location.search}` }}
      className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-light-bg dark:focus-visible:ring-dark-primary dark:focus-visible:ring-offset-dark-bg"
      aria-label={title}
    />
  );
};

export default SnippetCardLink;
