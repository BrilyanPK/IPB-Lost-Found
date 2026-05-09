import React, { Component } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export class Card extends Component<CardProps> {
  render() {
    const { children, className = '' } = this.props;
    return (
      <div className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${className}`}>
        {children}
      </div>
    );
  }
}
