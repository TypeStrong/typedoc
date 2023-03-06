export class Camera {
    /** One */
    static useCameraPermissions = createPermissionHook();
}

/** Two */
declare function createPermissionHook(): () => void;
