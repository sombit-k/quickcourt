'use server'

import { db } from '@/lib/prisma'

export async function createReport(reportData) {
  try {
    const report = await db.report.create({
      data: {
        type: reportData.type,
        reason: reportData.reason,
        description: reportData.description,
        reportedById: reportData.reportedById,
        targetUserId: reportData.targetUserId,
        facilityId: reportData.facilityId,
        status: 'PENDING'
      },
      include: {
        reportedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        targetUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        facility: {
          select: {
            name: true,
            address: true
          }
        }
      }
    })

    return report
  } catch (error) {
    console.error('Error creating report:', error)
    throw new Error('Failed to create report')
  }
}

export async function getAllReports(status = null, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    
    const where = {}
    if (status) {
      where.status = status
    }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          reportedBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          targetUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          facility: {
            select: {
              name: true,
              address: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      db.report.count({ where })
    ])

    return {
      reports,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
    throw new Error('Failed to fetch reports')
  }
}

export async function getReportById(reportId) {
  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        reportedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        targetUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isBanned: true
          }
        },
        facility: {
          select: {
            name: true,
            address: true,
            status: true,
            owner: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    return report
  } catch (error) {
    console.error('Error fetching report:', error)
    throw new Error('Failed to fetch report')
  }
}

export async function updateReportStatus(reportId, status, resolution = null) {
  try {
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status,
        resolution,
        updatedAt: new Date()
      },
      include: {
        reportedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        targetUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        facility: {
          select: {
            name: true
          }
        }
      }
    })

    return report
  } catch (error) {
    console.error('Error updating report status:', error)
    throw new Error('Failed to update report status')
  }
}

export async function takeReportAction(reportId, action, actionData = {}) {
  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        targetUser: true,
        facility: true
      }
    })

    if (!report) {
      throw new Error('Report not found')
    }

    let actionTaken = ''

    switch (action) {
      case 'ban_user':
        if (report.targetUserId) {
          await db.user.update({
            where: { id: report.targetUserId },
            data: { isBanned: true }
          })
          actionTaken = 'User has been banned'
        }
        break

      case 'suspend_facility':
        if (report.facilityId) {
          await db.facility.update({
            where: { id: report.facilityId },
            data: { status: 'SUSPENDED' }
          })
          actionTaken = 'Facility has been suspended'
        }
        break

      case 'warn_user':
        actionTaken = `Warning sent to user: ${actionData.warningMessage || 'General warning'}`
        break

      case 'no_action':
        actionTaken = 'No action taken - report dismissed as unfounded'
        break

      default:
        actionTaken = actionData.customAction || 'Custom action taken'
    }

    // Update report status
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolution: actionTaken,
        updatedAt: new Date()
      }
    })

    return updatedReport
  } catch (error) {
    console.error('Error taking report action:', error)
    throw new Error('Failed to take action on report')
  }
}

export async function getUserReports(userId, type = null) {
  try {
    const where = {
      OR: [
        { reportedById: userId },
        { targetUserId: userId }
      ]
    }

    if (type) {
      where.type = type
    }

    const reports = await db.report.findMany({
      where,
      include: {
        reportedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        targetUser: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        facility: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return reports
  } catch (error) {
    console.error('Error fetching user reports:', error)
    throw new Error('Failed to fetch user reports')
  }
}

export async function getFacilityReports(facilityId) {
  try {
    const reports = await db.report.findMany({
      where: { facilityId },
      include: {
        reportedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return reports
  } catch (error) {
    console.error('Error fetching facility reports:', error)
    throw new Error('Failed to fetch facility reports')
  }
}

export async function getReportStats() {
  try {
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      reportsByType,
      recentReports
    ] = await Promise.all([
      db.report.count(),
      db.report.count({ where: { status: 'PENDING' } }),
      db.report.count({ where: { status: 'RESOLVED' } }),
      db.report.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      db.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reportedBy: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          targetUser: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          facility: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    const typeBreakdown = {}
    reportsByType.forEach(item => {
      typeBreakdown[item.type] = item._count.type
    })

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      typeBreakdown,
      recentReports
    }
  } catch (error) {
    console.error('Error fetching report stats:', error)
    throw new Error('Failed to fetch report statistics')
  }
}

export async function bulkActionReports(reportIds, action, actionData = {}) {
  try {
    const results = []

    for (const reportId of reportIds) {
      try {
        const result = await takeReportAction(reportId, action, actionData)
        results.push({ reportId, success: true, result })
      } catch (error) {
        results.push({ reportId, success: false, error: error.message })
      }
    }

    return results
  } catch (error) {
    console.error('Error performing bulk action on reports:', error)
    throw new Error('Failed to perform bulk action on reports')
  }
}

export async function dismissReport(reportId, reason = null) {
  try {
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status: 'DISMISSED',
        resolution: reason || 'Report dismissed by administrator'
      }
    })

    return report
  } catch (error) {
    console.error('Error dismissing report:', error)
    throw new Error('Failed to dismiss report')
  }
}

export async function escalateReport(reportId, note = null) {
  try {
    const report = await db.report.update({
      where: { id: reportId },
      data: {
        status: 'UNDER_REVIEW',
        resolution: note || 'Report escalated for further review'
      }
    })

    return report
  } catch (error) {
    console.error('Error escalating report:', error)
    throw new Error('Failed to escalate report')
  }
}
