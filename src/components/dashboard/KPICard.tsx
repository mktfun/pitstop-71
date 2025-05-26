
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  linkTo?: string;
  linkText?: string;
  description?: string;
}

const KPICard = ({ title, value, icon: Icon, linkTo, linkText, description }: KPICardProps) => {
  return (
    <Card className="bg-card/95 backdrop-blur-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {linkTo && linkText && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mt-3 h-auto p-0 text-xs font-medium text-primary hover:text-primary/80"
          >
            <Link to={linkTo}>{linkText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
