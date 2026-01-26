import { getCollection } from '@/lib/db';
import { verifyToken, getTokenFromCookie } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const token = await getTokenFromCookie(request.headers.get('cookie') || '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await verifyToken(token);

        const projectsCollection = await getCollection('projects');
        const project = await projectsCollection.findOne({
            _id: new ObjectId(params.id),
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: project });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const token = await getTokenFromCookie(request.headers.get('cookie') || '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const projectsCollection = await getCollection('projects');

        const updateData: any = {
            updatedAt: new Date(),
        };

        // Update only provided fields
        if (body.projectName !== undefined) updateData.projectName = body.projectName;
        if (body.parishId !== undefined) updateData.parishId = body.parishId;
        if (body.parishName !== undefined) updateData.parishName = body.parishName;
        if (body.projectType !== undefined) updateData.projectType = body.projectType;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.budget !== undefined) updateData.budget = body.budget;
        if (body.startDate !== undefined) {
            updateData.startDate = body.startDate ? new Date(body.startDate) : null;
        }
        if (body.expectedEnd !== undefined) {
            updateData.expectedEnd = body.expectedEnd ? new Date(body.expectedEnd) : null;
        }
        if (body.actualEnd !== undefined) {
            updateData.actualEnd = body.actualEnd ? new Date(body.actualEnd) : null;
        }
        if (body.permitStatus !== undefined) updateData.permitStatus = body.permitStatus;
        if (body.progress !== undefined) updateData.progress = body.progress;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.images !== undefined) updateData.images = body.images;

        const result = await projectsCollection.findOneAndUpdate(
            { _id: new ObjectId(params.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: result });
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const token = await getTokenFromCookie(request.headers.get('cookie') || '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'super_admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const projectsCollection = await getCollection('projects');

        const result = await projectsCollection.deleteOne({
            _id: new ObjectId(params.id),
        });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
