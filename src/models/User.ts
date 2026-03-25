import mongoose, { Schema, Document } from "mongoose";

export interface ISavedLocation {
  lat: number;
  lng: number;
  label: string;
  createdAt: Date;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  createdAt: Date;
  savedLocations: ISavedLocation[];
}

const SavedLocationSchema = new Schema<ISavedLocation>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  label: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  savedLocations: [SavedLocationSchema],
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
