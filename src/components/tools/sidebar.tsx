import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Collapse} from 'react-bootstrap';
import {PagePropCommonDocument} from "types/pageProps";
import permissionUtil from "utils/permission.util";
import SidebarNavs, {SideBarPath} from "constants/sidebarNavs";
import SidebarNav from "constants/sidebarNavs";

type PageState = {
    isMenuOpen: any
};

type PageProps = {} & PagePropCommonDocument;

class Sidebar extends Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            isMenuOpen: {}
        };
    }

    componentDidMount() {
        this.onRouteChanged();
        const body = document.querySelector('body') as HTMLBodyElement;
        document.querySelectorAll('.sidebar .nav-item').forEach((el) => {

            el.addEventListener('mouseover', function () {
                if (body.classList.contains('sidebar-icon-only')) {
                    el.classList.add('hover-open');
                }
            });
            el.addEventListener('mouseout', function () {
                if (body.classList.contains('sidebar-icon-only')) {
                    el.classList.remove('hover-open');
                }
            });
        });
    }

    componentDidUpdate(prevProps: Readonly<PageProps>) {
        if (this.props.router.pathname !== prevProps.router.pathname) {
            this.onRouteChanged();
        }
    }

    onRouteChanged() {
        this.setState({
            isMenuOpen: {}
        }, () => {
            this.setIsMenuOpen(SidebarNav);
        })
    }

    setIsMenuOpen(sidebarSubPaths: SideBarPath[], stateKey?: string) {
        for(const sidebarNav of sidebarSubPaths) {
            if(this.props.router.pathname.startsWith(sidebarNav.path)) {
                this.toggleMenuState(sidebarNav.state);
            }

            if(sidebarNav.subPaths) this.setIsMenuOpen(sidebarNav.subPaths, sidebarNav.state);
        }
    }

    toggleMenuState(stateKey?: string) {
        if(stateKey){
            this.setState((state: PageState) => {
                state.isMenuOpen[stateKey] = !state.isMenuOpen[stateKey];
                return state;
            })
        }
    }

    isPathActive(path: string) {
        return this.props.router.pathname.search(path) > -1;
    }

    Item = (props: SideBarPath) => {
        let self = this;

        function HasChild(_props: SideBarPath) {
            if (!permissionUtil.checkPermissionPath(_props.path, self.props.getSessionData.roleId, self.props.getSessionData.permissions)) return null;
            return (
                <Link className={`nav-link ${self.isPathActive(_props.path) ? 'active' : ''}`} to={_props.path ?? ""}>
                    <span
                        className={`menu-title text-capitalize ${self.isPathActive(_props.path) ? 'active' : ''}`}>{self.props.t(_props.title)}</span>
                    <i className={`mdi mdi-${_props.icon} menu-icon`}></i>
                </Link>
            );
        }

        function HasChildren(_props: SideBarPath) {
            if (!permissionUtil.checkPermissionPath(_props.path, self.props.getSessionData.roleId, self.props.getSessionData.permissions)) return null;
            let state = (_props.state) ? self.state.isMenuOpen[_props.state] : false;
            return (
                <span>
                    <div className={`nav-link ${state ? 'menu-expanded' : ''} ${self.isPathActive(_props.path) ? 'active' : ''}`} onClick={() => self.toggleMenuState(_props.state)} data-toggle="collapse">
                        <span className={`menu-title text-capitalize ${self.isPathActive(_props.path) ? 'active' : ''}`}>{self.props.t(_props.title)}</span>
                        <i className="menu-arrow"></i>
                        <i className={`mdi mdi-${_props.icon} menu-icon`}></i>
                    </div>
                    <Collapse in={state}>
                      <ul className="nav flex-column sub-menu">
                        {
                            _props.subPaths?.map((item, index) => {
                                return (
                                    <li className="nav-item" key={index}>
                                        {
                                            item.subPaths ? <HasChildren key={index} {...item} /> : <HasChild key={index} {...item}/>
                                        }
                                    </li>
                                );
                            })
                        }
                      </ul>
                    </Collapse>
                </span>
            );
        }

        return (
            <li className={`nav-item ${self.isPathActive(props.path) ? 'active' : ''}`}>
                {
                    (props.subPaths) ? <HasChildren {...props} /> : <HasChild {...props}/>
                }
            </li>
        )
    }

    render() {
        return (
            <nav className="sidebar sidebar-offcanvas" id="sidebar">
                <ul className="nav pt-5">
                    {
                        SidebarNavs.map((item, index) => {
                            return <this.Item
                                key={index}
                                {...item}
                            />
                        })
                    }
                </ul>
            </nav>
        );
    }
}

export default Sidebar;