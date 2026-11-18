"use client"

import React from 'react';
import { CrownIcon, UserCircle, Mail, MoreHorizontal, Check, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { SettingsPageHeader, SettingsSection } from './shared';

export default function MyAddresses() {
    const { accounts, currAccount } = useAppSelector((state) => state.accounts)

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-150">
            <SettingsPageHeader
                title="Identity and addresses"
                description="Manage your email addresses, sending identities, and connected aliases."
                icon={<UserCircle className="size-5" />}
                badge={<Badge variant="outline" className="text-xs font-normal">Identities</Badge>}
                action={
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl h-9 text-xs sm:text-sm font-medium border-border/80"
                    >
                        <CrownIcon className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        Get More Aliases
                    </Button>
                }
            />

            <SettingsSection
                title="Configured Addresses & Aliases"
                description="Addresses associated with your Airsend Mail account"
                icon={<Mail className="size-4" />}
            >
                <div className="pt-2">
                    {/* Desktop & Tablet Table */}
                    <div className="hidden sm:block rounded-xl border border-border/60 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <th className="py-3 px-4">Address</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-sm">
                                {accounts.map((address) => (
                                    <tr key={address.email} className="hover:bg-muted/30 transition-colors">
                                        <td className="py-3.5 px-4 font-medium text-foreground">
                                            <div className="flex items-center gap-2.5">
                                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Mail className="size-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="truncate block font-mono text-xs sm:text-sm">
                                                        {address.email}
                                                    </span>
                                                    {address.name && (
                                                        <span className="text-xs text-muted-foreground block truncate">
                                                            {address.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {(address as any)?.isDefault && (
                                                    <Badge variant="default" className="text-[10px] uppercase font-semibold">
                                                        Default
                                                    </Badge>
                                                )}
                                                {(address as any)?.isActive && (
                                                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                                                        Active
                                                    </Badge>
                                                )}
                                                {address?.email === currAccount?.email && (
                                                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/40">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-lg text-xs"
                                            >
                                                <Edit2 className="size-3 mr-1" />
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="sm:hidden space-y-3">
                        {accounts.map((address) => (
                            <div
                                key={address.email}
                                className="p-3.5 rounded-xl border border-border/60 bg-background/50 space-y-2.5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <span className="font-mono text-xs font-medium text-foreground block truncate">
                                            {address.email}
                                        </span>
                                        {address.name && (
                                            <span className="text-[11px] text-muted-foreground block">
                                                {address.name}
                                            </span>
                                        )}
                                    </div>
                                    <Button variant="ghost" size="icon" className="size-8 rounded-lg shrink-0">
                                        <Edit2 className="size-3.5 text-muted-foreground" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/30">
                                    {(address as any)?.isDefault && (
                                        <Badge variant="default" className="text-[10px] uppercase font-semibold">
                                            Default
                                        </Badge>
                                    )}
                                    {(address as any)?.isActive && (
                                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                                            Active
                                        </Badge>
                                    )}
                                    {address?.email === currAccount?.email && (
                                        <Badge variant="outline" className="text-[10px] uppercase font-semibold text-primary border-primary/40">
                                            Current
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {accounts.length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                            No secondary addresses configured.
                        </div>
                    )}
                </div>
            </SettingsSection>
        </div>
    );
}
