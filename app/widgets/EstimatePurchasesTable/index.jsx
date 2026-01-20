import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Stack,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    Avatar,
    Box,
    TableRow,
    TableCell
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    IconCheck,
    IconAlertTriangle,
    IconPhoto,
    IconShoppingCartPlus
} from '@tabler/icons-react';

import DataTable from 'app/widgets/DataTable';
import { formatCurrency } from 'shared/lib/formatters';
import { estimateColors as colors } from 'shared/ui/themes/estimateStyle';

const styles = {
    header: {
        fontWeight: 700,
        bgcolor: colors.headerBg,
        color: '#4B5563',
        py: 0.5,
        borderBottom: `1px solid ${colors.border}`,
        fontSize: '10px !important',
        lineHeight: '1.2 !important',
        zIndex: 10
    },
    headerSub: {
        fontWeight: 700,
        bgcolor: colors.headerBg,
        color: '#4B5563',
        py: 0.5,
        borderBottom: `1px solid ${colors.border}`,
        fontSize: '10px !important',
        lineHeight: '1.2 !important',
        top: 22,
        zIndex: 10
    }
};

const EstimatePurchasesTable = ({
    regularMaterials,
    extraMaterials,
    getPurchaseStatus,
    onOpenAddDialog,
    loading
}) => {
    const data = useMemo(() => {
        const list = [...regularMaterials];
        if (extraMaterials.length > 0) {
            list.push({ _type: 'separator', count: extraMaterials.length });
            list.push(...extraMaterials);
        }
        return list;
    }, [regularMaterials, extraMaterials]);

    const columns = [
        {
            id: 'sku',
            label: 'Артикул',
            render: (row) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                    {row.isExtraCharge && (
                        <Chip
                            label="О/Ч"
                            size="small"
                            sx={{ bgcolor: colors.warning, color: '#fff', fontSize: '0.65rem', height: 18, fontWeight: 600 }}
                        />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 500, color: colors.primary, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {row.sku || '-'}
                    </Typography>
                </Stack>
            )
        },
        {
            id: 'name',
            label: 'Наименование материала',
            render: (row) => {
                const status = getPurchaseStatus(row);
                return (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {!row.isExtraCharge && (
                            <>
                                {status === 'complete' && <IconCheck size={16} color={colors.green} />}
                                {status === 'partial' && <IconAlertTriangle size={16} color={colors.warning} />}
                                {status === 'over' && <IconAlertTriangle size={16} color={colors.error} />}
                            </>
                        )}
                        <Typography variant="caption" sx={{ color: '#374151', fontWeight: row.isExtraCharge ? 500 : 400, fontSize: '0.75rem' }}>
                            {row.name}
                        </Typography>
                    </Stack>
                );
            }
        },
        {
            id: 'category',
            label: 'Категория',
            render: (row) => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {row.categoryFullPath ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                            {row.categoryFullPath.split(' / ').map((part, idx, arr) => (
                                <React.Fragment key={idx}>
                                    <Typography sx={{ fontSize: '0.7rem', color: idx === arr.length - 1 ? colors.primary : '#9CA3AF', fontWeight: idx === arr.length - 1 ? 500 : 400 }}>
                                        {part}
                                    </Typography>
                                    {idx < arr.length - 1 && (
                                        <Typography sx={{ fontSize: '0.7rem', color: '#D1D5DB' }}>›</Typography>
                                    )}
                                </React.Fragment>
                            ))}
                        </Box>
                    ) : (
                        <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                            {row.category || '—'}
                        </Typography>
                    )}
                </Box>
            )
        },
        {
            id: 'image',
            label: 'Фото',
            align: 'center',
            render: (row) => (
                row.image ? (
                    <Tooltip title="Нажмите для увеличения">
                        <Avatar
                            src={row.image}
                            alt={row.name}
                            variant="rounded"
                            sx={{
                                width: 36,
                                height: 36,
                                border: `1px solid ${row.isExtraCharge ? colors.warning : colors.border}`,
                                margin: '0 auto',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                            }}
                        />
                    </Tooltip>
                ) : (
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: row.isExtraCharge ? colors.warning : '#F3F4F6',
                            color: row.isExtraCharge ? '#fff' : 'inherit',
                            margin: '0 auto'
                        }}
                    >
                        <IconPhoto size={16} color={row.isExtraCharge ? '#fff' : "#9CA3AF"} />
                    </Avatar>
                )
            )
        },
        {
            id: 'unit',
            label: 'Ед.',
            align: 'center',
            render: (row) => (
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                    {row.unit}
                </Typography>
            )
        },
        {
            id: 'quantity',
            label: 'Нужно',
            align: 'right',
            render: (row) => (
                <Typography variant="caption" sx={{ fontWeight: 500, color: '#374151', fontSize: '0.75rem' }}>
                    {row.quantity.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </Typography>
            )
        },
        {
            id: 'purchased',
            label: 'Закуплено',
            align: 'right',
            render: (row) => (
                <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: row.purchasedQuantity > 0 ? colors.green : colors.textSecondary, fontSize: '0.75rem' }}
                >
                    {(row.purchasedQuantity || 0).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </Typography>
            )
        },
        {
            id: 'remainder',
            label: 'Остаток',
            align: 'right',
            render: (row) => {
                const status = getPurchaseStatus(row);
                const remainder = row.quantity - (row.purchasedQuantity || 0);

                if (status === 'complete') {
                    return (
                        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                            <IconCheck size={14} color={colors.green} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: colors.green, fontSize: '0.75rem' }}>Закуплено</Typography>
                        </Stack>
                    );
                }
                if (status === 'none' && !row.isExtraCharge) {
                    return <Typography variant="caption" sx={{ color: '#9CA3AF', textAlign: 'right', fontSize: '0.75rem' }}>—</Typography>;
                }

                return (
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        <IconAlertTriangle
                            size={14}
                            color={status === 'over' ? colors.error : (row.isExtraCharge ? '#92400E' : colors.warning)}
                        />
                        <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: status === 'over' ? colors.error : (row.isExtraCharge ? '#92400E' : colors.warning), fontSize: '0.75rem' }}
                        >
                            {remainder.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </Typography>
                    </Stack>
                );
            },
            cellSx: {
                bgcolor: (row) => {
                    const status = getPurchaseStatus(row);
                    if (status === 'complete') return colors.greenLight;
                    if (status === 'over') return colors.errorLight;
                    if (row.isExtraCharge) return alpha(colors.warning, 0.2);
                    if (status === 'partial') return colors.warningLight;
                    return 'transparent';
                }
            }
        },
        {
            id: 'plan_price',
            label: 'Цена',
            align: 'right',
            render: (row) => (
                <Typography variant="caption" sx={{ color: row.isExtraCharge ? '#92400E' : '#374151', fontWeight: row.isExtraCharge ? 500 : 400, fontSize: '0.75rem' }}>
                    {formatCurrency(row.price)}
                </Typography>
            ),
            cellSx: {
                 borderLeft: `2px solid ${colors.border}`,
                 bgcolor: (row) => row.isExtraCharge ? alpha(colors.warning, 0.05) : 'inherit'
            }
        },
        {
            id: 'plan_total',
            label: 'Сумма',
            align: 'right',
            render: (row) => (
                <Typography variant="caption" sx={{ fontWeight: row.isExtraCharge ? 700 : 600, color: row.isExtraCharge ? '#92400E' : '#1F2937', fontSize: '0.75rem' }}>
                    {formatCurrency(row.total)}
                </Typography>
            ),
            cellSx: {
                bgcolor: (row) => row.isExtraCharge ? alpha(colors.warning, 0.05) : 'inherit'
            }
        },
        {
            id: 'fact_price',
            label: 'Цена',
            align: 'right',
            render: (row) => row.avgPurchasePrice ? (
                <Typography variant="caption" sx={{ fontWeight: 500, color: colors.green, fontSize: '0.75rem' }}>
                    {formatCurrency(row.avgPurchasePrice)}
                </Typography>
            ) : (
                <Typography variant="caption" sx={{ color: '#D1D5DB', fontSize: '0.75rem' }}>—</Typography>
            ),
            cellSx: {
                borderLeft: `2px solid ${colors.green}`,
                bgcolor: (row) => row.isExtraCharge ? alpha(colors.warning, 0.05) : 'inherit'
            }
        },
        {
            id: 'fact_total',
            label: 'Сумма',
            align: 'right',
            render: (row) => row.actualTotalPrice > 0 ? (
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.green, fontSize: '0.75rem' }}>
                    {formatCurrency(row.actualTotalPrice)}
                </Typography>
            ) : (
                <Typography variant="caption" sx={{ color: '#D1D5DB', fontSize: '0.75rem' }}>—</Typography>
            ),
            cellSx: {
                bgcolor: (row) => row.isExtraCharge ? alpha(colors.warning, 0.05) : 'inherit'
            }
        },
        {
            id: 'actions',
            label: 'Действия',
            align: 'center',
            render: (row) => (
                <Tooltip title="Добавить в общие закупки">
                    <IconButton
                        size="medium"
                        onClick={() => onOpenAddDialog(row)}
                        sx={{
                            color: colors.textSecondary,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                color: row.isExtraCharge ? colors.warning : colors.primary,
                                bgcolor: row.isExtraCharge ? alpha(colors.warning, 0.15) : alpha(colors.primary, 0.12),
                                transform: 'scale(1.05)'
                            }
                        }}
                    >
                        <IconShoppingCartPlus size={24} />
                    </IconButton>
                </Tooltip>
            ),
            cellSx: {
                '&:hover': { bgcolor: (row) => row.isExtraCharge ? 'rgba(245, 158, 11, 0.06)' : 'rgba(79, 70, 229, 0.04)' }
            }
        }
    ];

    const customHeader = (
        <React.Fragment>
            <TableRow>
                <TableCell rowSpan={2} sx={styles.header}>Артикул</TableCell>
                <TableCell rowSpan={2} sx={styles.header}>Наименование материала</TableCell>
                <TableCell rowSpan={2} sx={styles.header}>Категория</TableCell>
                <TableCell rowSpan={2} align="center" sx={styles.header}>Фото</TableCell>
                <TableCell rowSpan={2} align="center" sx={styles.header}>Ед.</TableCell>
                <TableCell rowSpan={2} align="right" sx={styles.header}>Нужно</TableCell>
                <TableCell rowSpan={2} align="right" sx={styles.header}>Закуплено</TableCell>
                <TableCell rowSpan={2} align="right" sx={styles.header}>
                    <Tooltip title="Остаток = Нужно − Закуплено" arrow>
                        <span style={{ cursor: 'help', borderBottom: '1px dashed #9CA3AF' }}>Остаток</span>
                    </Tooltip>
                </TableCell>
                <TableCell colSpan={2} align="center" sx={{ ...styles.header, borderLeft: `2px solid ${colors.border}` }}>
                    ПЛАН (смета)
                </TableCell>
                <TableCell colSpan={2} align="center" sx={{ ...styles.header, bgcolor: colors.greenLight, color: colors.greenDark, borderLeft: `2px solid ${colors.green}` }}>
                    ФАКТ (закупки)
                </TableCell>
                <TableCell rowSpan={2} align="center" sx={styles.header}>Действия</TableCell>
            </TableRow>
            <TableRow>
                <TableCell align="right" sx={{ ...styles.headerSub, borderLeft: `2px solid ${colors.border}` }}>Цена ₽/ед</TableCell>
                <TableCell align="right" sx={styles.headerSub}>Сумма</TableCell>
                <TableCell align="right" sx={{ ...styles.headerSub, bgcolor: colors.greenLight, color: colors.greenDark, borderLeft: `2px solid ${colors.green}` }}>Цена ₽/ед</TableCell>
                <TableCell align="right" sx={{ ...styles.headerSub, bgcolor: colors.greenLight, color: colors.greenDark }}>Сумма</TableCell>
            </TableRow>
        </React.Fragment>
    );

    const renderRow = (row, index, cols) => {
        if (row._type === 'separator') {
             return (
                <TableRow key="separator">
                    <TableCell colSpan={14} sx={{ bgcolor: colors.warningLight, borderTop: `2px solid ${colors.warning}`, py: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Chip label="О/Ч" size="small" sx={{ bgcolor: colors.warning, color: '#fff', fontWeight: 600 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#92400E' }}>
                                Отдельные чеки (не учтены в смете) — {row.count} позиций
                            </Typography>
                        </Stack>
                    </TableCell>
                </TableRow>
             );
        }
        return null;
    };

    const rowSx = (row, index) => {
        const status = getPurchaseStatus(row);
        const isExtra = row.isExtraCharge;

        return {
            bgcolor: isExtra ? alpha(colors.warning, 0.08) : (index % 2 === 0 ? '#fff' : '#FAFAFA'),
            '&:hover': { bgcolor: isExtra ? alpha(colors.warning, 0.15) : colors.cardBg },
            '& td': {
                py: 0.75,
                borderBottom: `1px solid ${colors.border}`
            },
            ...(!isExtra && status === 'over' && {
                borderLeft: `3px solid ${colors.error}`
            })
        };
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            rowKey={(row) => row._type === 'separator' ? 'separator' : (row.id || row.materialId)}
            header={customHeader}
            renderRow={renderRow}
            rowSx={rowSx}
            isLoading={loading}
            emptyText="Нет закупок"
            sx={{ '& .MuiTableCell-root': { fontSize: '0.75rem' } }}
        />
    );
};

EstimatePurchasesTable.propTypes = {
    regularMaterials: PropTypes.array.isRequired,
    extraMaterials: PropTypes.array.isRequired,
    getPurchaseStatus: PropTypes.func.isRequired,
    onOpenAddDialog: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default EstimatePurchasesTable;
