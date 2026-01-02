"use client";
import React from 'react';
import { Card } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  animation: `${pulse} 2s infinite`,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

export default function AnimatedCard({ children, ...props }) {
  return (
    <StyledCard {...props}>
      {children}
    </StyledCard>
  );
}
