import { useLocation, useNavigate, useParams } from 'react-router-dom';

export interface WithRouterProps {
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  params: Record<string, string>;
}

export function withRouter<P extends WithRouterProps>(
  Component: React.ComponentType<P>
) {
  return function ComponentWithRouterProp(props: Omit<P, keyof WithRouterProps>) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    
    return (
      <Component
        {...(props as P)}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  };
}
