import React, { Component } from 'react';

class Footer extends Component {
  render () {
    return (
      <footer className="footer">
        <div className="d-sm-flex justify-content-center justify-content-sm-between py-2">
          <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">Copyright © {new Date().getFullYear()} <a href="https://www.merkersoft.com/" target="_blank" rel="noopener noreferrer">MerkerSoft.com </a></span>
        </div>
      </footer> 
    );
  }
}

export default Footer;